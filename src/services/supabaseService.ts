import { supabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  StudyTrack,
  StudySession,
  ScheduleBlock,
  EnrichedScheduleBlock,
  SessionStatus,
  TargetPeriod,
  PriorityRank,
} from '../types/study';
import {
  loadStoredData,
  saveBlocks,
  saveTrack,
  saveTracks,
  deleteTrackLocal,
} from './storageService';

/**
 * Busca blocos de agendamento do usuário com joins relacionais aninhados:
 * schedule_blocks -> study_sessions -> study_tracks.
 *
 * REGRA RIGOROSA DE ISOLAMENTO:
 * - Se `userId` for informado, NUNCA retorna mocks caso o banco esteja vazio!
 */
export async function fetchUserScheduleBlocks(
  targetDate: string,
  userId?: string
): Promise<EnrichedScheduleBlock[]> {
  if (!isSupabaseConfigured()) {
    return loadStoredData(userId).blocks;
  }

  try {
    // Consulta relacional aninhada
    let query = supabaseClient
      .from('schedule_blocks')
      .select(
        `
        id,
        user_id,
        session_id,
        target_date,
        target_period,
        priority_rank,
        ai_justification,
        is_rescheduled,
        created_at,
        study_sessions (
          id,
          track_id,
          user_id,
          sequence_order,
          title,
          session_type,
          estimated_duration_min,
          cognitive_effort,
          learning_goals,
          recommended_approach,
          status,
          perceived_difficulty,
          notes,
          created_at,
          study_tracks (
            id,
            user_id,
            title,
            category,
            overview,
            color_hex,
            is_archived,
            created_at,
            updated_at
          )
        )
      `
      )
      .eq('target_date', targetDate);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('priority_rank', { ascending: false });

    if (error) {
      console.warn('[Supabase Join Warning]: Erro na consulta aninhada, executando fallback por ID:', error.message);
      return await fetchUserScheduleBlocksManual(targetDate, userId);
    }

    if (!data || data.length === 0) {
      // Se for usuário real e o banco não tiver blocos nessa data:
      if (userId) {
        return loadStoredData(userId).blocks; // Retorna o cache do usuário (ou [])
      }
      return loadStoredData().blocks;
    }

    // Mapear resultado relacional aninhado
    const enriched: EnrichedScheduleBlock[] = [];
    for (const item of data as any[]) {
      const sessionObj = Array.isArray(item.study_sessions)
        ? item.study_sessions[0]
        : item.study_sessions;

      if (!sessionObj) continue;

      const trackObj = Array.isArray(sessionObj.study_tracks)
        ? sessionObj.study_tracks[0]
        : sessionObj.study_tracks;

      enriched.push({
        id: item.id,
        user_id: item.user_id,
        session_id: item.session_id,
        target_date: item.target_date,
        target_period: item.target_period,
        priority_rank: item.priority_rank,
        ai_justification: item.ai_justification || '',
        is_rescheduled: item.is_rescheduled || false,
        created_at: item.created_at,
        session: sessionObj as StudySession,
        track: trackObj as StudyTrack,
      });
    }

    saveBlocks(enriched, userId);
    return enriched;
  } catch (err) {
    console.error('[Supabase Fetch Error]:', err);
    return loadStoredData(userId).blocks;
  }
}

/**
 * Fallback resiliente para busca manual por chaves primárias/estrangeiras.
 */
async function fetchUserScheduleBlocksManual(
  targetDate: string,
  userId?: string
): Promise<EnrichedScheduleBlock[]> {
  try {
    let query = supabaseClient.from('schedule_blocks').select('*').eq('target_date', targetDate);
    if (userId) query = query.eq('user_id', userId);

    const { data: blocks, error: bErr } = await query;
    if (bErr || !blocks || blocks.length === 0) return loadStoredData(userId).blocks;

    const sessionIds = blocks.map((b) => b.session_id);
    const { data: sessions, error: sErr } = await supabaseClient
      .from('study_sessions')
      .select('*')
      .in('id', sessionIds);
    if (sErr || !sessions) return loadStoredData(userId).blocks;

    const trackIds = Array.from(new Set(sessions.map((s) => s.track_id)));
    const { data: tracks, error: tErr } = await supabaseClient
      .from('study_tracks')
      .select('*')
      .in('id', trackIds);
    if (tErr || !tracks) return loadStoredData(userId).blocks;

    const enriched: EnrichedScheduleBlock[] = blocks.map((b) => {
      const session = sessions.find((s) => s.id === b.session_id) as StudySession;
      const track = tracks.find((t) => t.id === session?.track_id) as StudyTrack;
      return {
        ...b,
        session,
        track,
      };
    });

    saveBlocks(enriched, userId);
    return enriched;
  } catch (err) {
    console.error('[Supabase Manual Fetch Error]:', err);
    return loadStoredData(userId).blocks;
  }
}

/**
 * Busca todas as trilhas cadastradas do usuário.
 * Retorna estritamente [] caso o usuário real não possua trilhas.
 */
export async function fetchUserTracks(userId?: string): Promise<StudyTrack[]> {
  if (!isSupabaseConfigured() || !userId) {
    return loadStoredData(userId).tracks;
  }

  try {
    const { data, error } = await supabaseClient
      .from('study_tracks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase fetchUserTracks Error]:', error.message);
      return loadStoredData(userId).tracks;
    }

    const tracks = (data || []) as StudyTrack[];
    saveTracks(tracks, userId);
    return tracks;
  } catch (err) {
    console.error('[Supabase fetchUserTracks Exception]:', err);
    return loadStoredData(userId).tracks;
  }
}

/**
 * Atualiza o status e/ou feedback de uma sessão de estudo.
 */
export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  feedback?: { perceived_difficulty?: number; notes?: string }
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const payload: Record<string, any> = { status };
    if (feedback?.perceived_difficulty !== undefined) {
      payload.perceived_difficulty = feedback.perceived_difficulty;
    }
    if (feedback?.notes !== undefined) {
      payload.notes = feedback.notes;
    }

    const { error } = await supabaseClient
      .from('study_sessions')
      .update(payload)
      .eq('id', sessionId);

    if (error) throw error;
  } catch (err) {
    console.error('[Supabase updateSessionStatus Error]:', err);
  }
}

/**
 * Atualiza detalhes de uma trilha (título, categoria, overview, cor).
 */
export async function updateTrackDetails(
  track: StudyTrack,
  userId?: string
): Promise<void> {
  saveTrack(track, userId);

  if (!isSupabaseConfigured()) return;

  try {
    const { error } = await supabaseClient
      .from('study_tracks')
      .update({
        title: track.title,
        category: track.category,
        overview: track.overview,
        color_hex: track.color_hex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', track.id);

    if (error) throw error;
  } catch (err) {
    console.error('[Supabase updateTrackDetails Error]:', err);
    throw err;
  }
}

/**
 * Exclui uma trilha e todas as suas sessões e blocos atômicos em cascata.
 */
export async function deleteTrackAndSessions(
  trackId: string,
  userId?: string
): Promise<void> {
  deleteTrackLocal(trackId, userId);

  if (!isSupabaseConfigured()) return;

  try {
    // 1. Obter IDs das sessões vinculadas à trilha
    const { data: sessions } = await supabaseClient
      .from('study_sessions')
      .select('id')
      .eq('track_id', trackId);

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s) => s.id);
      // 2. Deletar blocos que referenciam essas sessões
      await supabaseClient.from('schedule_blocks').delete().in('session_id', sessionIds);
      // 3. Deletar as sessões
      await supabaseClient.from('study_sessions').delete().eq('track_id', trackId);
    }

    // 4. Deletar a trilha
    const { error } = await supabaseClient.from('study_tracks').delete().eq('id', trackId);
    if (error) throw error;
  } catch (err) {
    console.error('[Supabase deleteTrackAndSessions Error]:', err);
    throw err;
  }
}

/**
 * Persiste nova trilha, suas sessões e blocos com rollback defensivo.
 */
export async function persistNewTrackAndSessions(
  track: StudyTrack,
  sessions: StudySession[],
  targetDate: string,
  userId?: string
): Promise<EnrichedScheduleBlock[]> {
  saveTrack(track, userId);

  if (!isSupabaseConfigured()) {
    return mapSessionsToLocalBlocks(track, sessions, targetDate);
  }

  let trackInserted = false;
  let sessionsInserted = false;

  try {
    // 1. Inserir Trilha
    const { error: trackErr } = await supabaseClient.from('study_tracks').insert({
      id: track.id,
      user_id: track.user_id,
      title: track.title,
      category: track.category,
      overview: track.overview,
      color_hex: track.color_hex,
      is_archived: track.is_archived,
    });
    if (trackErr) throw new Error(`Falha ao inserir trilha: ${trackErr.message}`);
    trackInserted = true;

    // 2. Inserir Sessões
    const sessionsPayload = sessions.map((s) => ({
      id: s.id,
      track_id: track.id,
      user_id: s.user_id,
      sequence_order: s.sequence_order,
      title: s.title,
      session_type: s.session_type,
      estimated_duration_min: s.estimated_duration_min,
      cognitive_effort: s.cognitive_effort,
      learning_goals: s.learning_goals,
      recommended_approach: s.recommended_approach,
      status: s.status || 'todo',
    }));

    const { error: sessErr } = await supabaseClient.from('study_sessions').insert(sessionsPayload);
    if (sessErr) throw new Error(`Falha ao inserir sessões: ${sessErr.message}`);
    sessionsInserted = true;

    // 3. Gerar e Inserir Blocos de Agendamento
    const periodsSequence: TargetPeriod[] = ['morning', 'afternoon', 'evening', 'night'];
    const blocksPayload: ScheduleBlock[] = sessions.map((sess, idx) => {
      let targetPeriod: TargetPeriod =
        sess.cognitive_effort === 'high'
          ? 'morning'
          : sess.cognitive_effort === 'medium'
          ? 'afternoon'
          : 'evening';

      if (idx > 0 && idx < periodsSequence.length) {
        targetPeriod = periodsSequence[idx % periodsSequence.length];
      }

      const priorityRank: PriorityRank =
        sess.cognitive_effort === 'high' ? 5 : sess.cognitive_effort === 'medium' ? 4 : 3;

      return {
        id: crypto.randomUUID ? crypto.randomUUID() : `blk_${Date.now()}_${idx}`,
        user_id: sess.user_id,
        session_id: sess.id,
        target_date: targetDate,
        target_period: targetPeriod,
        priority_rank: priorityRank,
        ai_justification: `Alocado pela IA com base no esforço cognitivo ${sess.cognitive_effort.toUpperCase()}.`,
        is_rescheduled: false,
      };
    });

    const { error: blkErr } = await supabaseClient.from('schedule_blocks').insert(blocksPayload);
    if (blkErr) throw new Error(`Falha ao inserir blocos: ${blkErr.message}`);

    const enrichedResult: EnrichedScheduleBlock[] = blocksPayload.map((b, i) => ({
      ...b,
      session: sessions[i],
      track,
    }));

    return enrichedResult;
  } catch (err: unknown) {
    console.error('[Supabase Transaction Error - Iniciando Rollback Defensivo]:', err);

    if (sessionsInserted) {
      await supabaseClient.from('study_sessions').delete().eq('track_id', track.id);
    }
    if (trackInserted) {
      await supabaseClient.from('study_tracks').delete().eq('id', track.id);
    }

    throw err;
  }
}

/**
 * Sincroniza o cronograma rebalanceado substituindo os blocos do ciclo de datas informado.
 */
export async function syncRebalancedBlocks(
  allocatedBlocks: EnrichedScheduleBlock[],
  dateList: string[],
  userId?: string
): Promise<void> {
  saveBlocks(allocatedBlocks, userId);

  if (!isSupabaseConfigured() || dateList.length === 0) return;

  try {
    let deleteQuery = supabaseClient
      .from('schedule_blocks')
      .delete()
      .in('target_date', dateList);

    if (userId) {
      deleteQuery = deleteQuery.eq('user_id', userId);
    }

    const { error: delErr } = await deleteQuery;
    if (delErr) {
      console.warn('[Supabase Sync Rebalance Delete Warning]:', delErr.message);
    }

    const insertPayload = allocatedBlocks.map((b) => ({
      id: b.id,
      user_id: b.user_id,
      session_id: b.session_id,
      target_date: b.target_date,
      target_period: b.target_period,
      priority_rank: b.priority_rank,
      ai_justification: b.ai_justification,
      is_rescheduled: b.is_rescheduled,
    }));

    const { error: insErr } = await supabaseClient.from('schedule_blocks').upsert(insertPayload);
    if (insErr) throw insErr;

    console.info(`[Supabase] ${insertPayload.length} blocos sincronizados com sucesso.`);
  } catch (err) {
    console.error('[Supabase syncRebalancedBlocks Error]:', err);
  }
}

function mapSessionsToLocalBlocks(
  track: StudyTrack,
  sessions: StudySession[],
  targetDate: string
): EnrichedScheduleBlock[] {
  const periodsSequence: TargetPeriod[] = ['morning', 'afternoon', 'evening', 'night'];
  return sessions.map((sess, idx) => {
    let targetPeriod: TargetPeriod =
      sess.cognitive_effort === 'high'
        ? 'morning'
        : sess.cognitive_effort === 'medium'
        ? 'afternoon'
        : 'evening';

    if (idx > 0 && idx < periodsSequence.length) {
      targetPeriod = periodsSequence[idx % periodsSequence.length];
    }

    const priorityRank: PriorityRank =
      sess.cognitive_effort === 'high' ? 5 : sess.cognitive_effort === 'medium' ? 4 : 3;

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `blk_${Date.now()}_${idx}`,
      user_id: sess.user_id,
      session_id: sess.id,
      target_date: targetDate,
      target_period: targetPeriod,
      priority_rank: priorityRank,
      ai_justification: `Alocado localmente pela IA (${sess.cognitive_effort.toUpperCase()}).`,
      is_rescheduled: false,
      session: sess,
      track,
    };
  });
}
