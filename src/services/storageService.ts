import {
  EnrichedScheduleBlock,
  StudyTrack,
} from '../types/study';
import { mockEnrichedScheduleBlocks, mockTrack } from '../mocks/study-data';

const STORAGE_KEY_DEMO_BLOCKS = 'studypilot_demo_blocks_v1';
const STORAGE_KEY_DEMO_TRACKS = 'studypilot_demo_tracks_v1';

export interface ExportBackupData {
  version: string;
  exported_at: string;
  blocks: EnrichedScheduleBlock[];
  tracks: StudyTrack[];
}

function getBlocksKey(userId?: string): string {
  return userId ? `studypilot_user_${userId}_blocks_v1` : STORAGE_KEY_DEMO_BLOCKS;
}

function getTracksKey(userId?: string): string {
  return userId ? `studypilot_user_${userId}_tracks_v1` : STORAGE_KEY_DEMO_TRACKS;
}

/**
 * Carrega dados armazenados localmente.
 * REGRA RIGOROSA DE ISOLAMENTO (v1.2.1):
 * - Se `userId` for informado (usuário real autenticado): NUNCA injeta dados mockados de teste!
 *   Se não houver registros salvos para o usuário, retorna estritamente { blocks: [], tracks: [] }.
 * - Mocks de demonstração pré-carregados existem EXCLUSIVAMENTE quando `isDemo` for verdadeiro e não houver `userId`.
 */
export function loadStoredData(
  userId?: string,
  isDemo?: boolean
): {
  blocks: EnrichedScheduleBlock[];
  tracks: StudyTrack[];
} {
  if (typeof window === 'undefined') {
    if (userId) {
      return { blocks: [], tracks: [] };
    }
    return {
      blocks: mockEnrichedScheduleBlocks,
      tracks: [mockTrack],
    };
  }

  try {
    const blocksKey = getBlocksKey(userId);
    const tracksKey = getTracksKey(userId);

    const rawBlocks = localStorage.getItem(blocksKey);
    const rawTracks = localStorage.getItem(tracksKey);

    // Se é usuário real autenticado:
    if (userId) {
      const blocks: EnrichedScheduleBlock[] = rawBlocks ? JSON.parse(rawBlocks) : [];
      const tracks: StudyTrack[] = rawTracks ? JSON.parse(rawTracks) : [];
      return { blocks, tracks };
    }

    // Se é sessão demo / visitante:
    if (!rawBlocks) {
      saveBlocks(mockEnrichedScheduleBlocks);
      saveTracks([mockTrack]);
      return {
        blocks: mockEnrichedScheduleBlocks,
        tracks: [mockTrack],
      };
    }

    const blocks: EnrichedScheduleBlock[] = JSON.parse(rawBlocks);
    const tracks: StudyTrack[] = rawTracks ? JSON.parse(rawTracks) : [mockTrack];
    return { blocks, tracks };
  } catch (err) {
    console.error('Erro ao ler dados do localStorage:', err);
    if (userId) {
      return { blocks: [], tracks: [] };
    }
    return {
      blocks: mockEnrichedScheduleBlocks,
      tracks: [mockTrack],
    };
  }
}

/**
 * Salva a lista de blocos de estudo no localStorage para o usuário ou demo.
 */
export function saveBlocks(blocks: EnrichedScheduleBlock[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getBlocksKey(userId);
    localStorage.setItem(key, JSON.stringify(blocks));
  } catch (err) {
    console.error('Falha ao gravar blocos no localStorage:', err);
  }
}

/**
 * Salva a lista de trilhas de estudo no localStorage para o usuário ou demo.
 */
export function saveTracks(tracks: StudyTrack[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getTracksKey(userId);
    localStorage.setItem(key, JSON.stringify(tracks));
  } catch (err) {
    console.error('Falha ao gravar trilhas no localStorage:', err);
  }
}

/**
 * Adiciona ou atualiza uma trilha no armazenamento local.
 */
export function saveTrack(track: StudyTrack, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const { tracks } = loadStoredData(userId);
    const exists = tracks.some((t) => t.id === track.id);
    const updated = exists ? tracks.map((t) => (t.id === track.id ? track : t)) : [track, ...tracks];
    saveTracks(updated, userId);
  } catch (err) {
    console.error('Falha ao salvar nova trilha:', err);
  }
}

/**
 * Exclui uma trilha e todos os blocos associados do armazenamento local.
 */
export function deleteTrackLocal(trackId: string, userId?: string): {
  tracks: StudyTrack[];
  blocks: EnrichedScheduleBlock[];
} {
  const { tracks, blocks } = loadStoredData(userId);
  const updatedTracks = tracks.filter((t) => t.id !== trackId);
  const updatedBlocks = blocks.filter((b) => b.track?.id !== trackId);

  saveTracks(updatedTracks, userId);
  saveBlocks(updatedBlocks, userId);

  return { tracks: updatedTracks, blocks: updatedBlocks };
}

/**
 * Restaura o estado padrão de mocks (exclusivo para demo).
 */
export function resetToDefaultMock(userId?: string): {
  blocks: EnrichedScheduleBlock[];
  tracks: StudyTrack[];
} {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(getBlocksKey(userId));
    localStorage.removeItem(getTracksKey(userId));
  }
  return loadStoredData(userId, !userId);
}

/**
 * Exporta todo o estado do usuário/sessão como um arquivo JSON baixável.
 */
export function exportDataAsJSON(userId?: string): void {
  if (typeof window === 'undefined') return;

  const { blocks, tracks } = loadStoredData(userId);
  const backup: ExportBackupData = {
    version: '1.2.1',
    exported_at: new Date().toISOString(),
    blocks,
    tracks,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `cadence_backup_${userId ? 'user' : 'demo'}_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importa e valida um backup JSON previamente salvo para o usuário atual.
 */
export function importDataFromJSON(
  fileContent: string,
  userId?: string
): {
  blocks: EnrichedScheduleBlock[];
  tracks: StudyTrack[];
} {
  try {
    const parsed = JSON.parse(fileContent);

    if (!parsed || (!parsed.blocks && !Array.isArray(parsed))) {
      throw new Error('Arquivo de backup inválido: formato incompatível.');
    }

    const blocks: EnrichedScheduleBlock[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.blocks)
      ? parsed.blocks
      : [];

    const tracks: StudyTrack[] = Array.isArray(parsed.tracks)
      ? parsed.tracks
      : [];

    saveBlocks(blocks, userId);
    saveTracks(tracks, userId);

    return { blocks, tracks };
  } catch (err) {
    console.error('Falha ao processar arquivo de importação:', err);
    throw new Error(
      err instanceof Error
        ? err.message
        : 'Formato de arquivo JSON corrompido ou incompatível.'
    );
  }
}
