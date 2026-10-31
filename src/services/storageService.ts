import {
  EnrichedScheduleBlock,
  StudyTrack,
} from '../types/study';
import { mockEnrichedScheduleBlocks, mockTrack } from '../mocks/study-data';

const STORAGE_KEY_BLOCKS = 'studypilot_blocks_v1';
const STORAGE_KEY_TRACKS = 'studypilot_tracks_v1';

export interface ExportBackupData {
  version: string;
  exported_at: string;
  blocks: EnrichedScheduleBlock[];
  tracks: StudyTrack[];
}

/**
 * Carrega os blocos armazenados no localStorage.
 * Se não houver dados gravados, inicializa com os mocks homologados.
 */
export function loadStoredData(): {
  blocks: EnrichedScheduleBlock[];
  tracks: StudyTrack[];
} {
  if (typeof window === 'undefined') {
    return {
      blocks: mockEnrichedScheduleBlocks,
      tracks: [mockTrack],
    };
  }

  try {
    const rawBlocks = localStorage.getItem(STORAGE_KEY_BLOCKS);
    const rawTracks = localStorage.getItem(STORAGE_KEY_TRACKS);

    if (!rawBlocks) {
      // Primeiro acesso: inicializa com mocks
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
    console.error('Erro ao ler dados do localStorage, restaurando mocks:', err);
    return {
      blocks: mockEnrichedScheduleBlocks,
      tracks: [mockTrack],
    };
  }
}

/**
 * Salva a lista de blocos de estudo no localStorage.
 */
export function saveBlocks(blocks: EnrichedScheduleBlock[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(blocks));
  } catch (err) {
    console.error('Falha ao gravar blocos no localStorage:', err);
  }
}

/**
 * Salva a lista de trilhas de estudo no localStorage.
 */
export function saveTracks(tracks: StudyTrack[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TRACKS, JSON.stringify(tracks));
  } catch (err) {
    console.error('Falha ao gravar trilhas no localStorage:', err);
  }
}

/**
 * Adiciona uma nova trilha ao registro persistido.
 */
export function saveTrack(track: StudyTrack): void {
  if (typeof window === 'undefined') return;
  try {
    const { tracks } = loadStoredData();
    const exists = tracks.some((t) => t.id === track.id);
    const updated = exists ? tracks.map((t) => (t.id === track.id ? track : t)) : [track, ...tracks];
    saveTracks(updated);
  } catch (err) {
    console.error('Falha ao salvar nova trilha:', err);
  }
}

/**
 * Restaura o estado inicial padrão de mocks no localStorage.
 */
export function resetToDefaultMock(): {
  blocks: EnrichedScheduleBlock[];
  tracks: StudyTrack[];
} {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_BLOCKS);
    localStorage.removeItem(STORAGE_KEY_TRACKS);
  }
  return loadStoredData();
}

/**
 * Exporta todo o estado do StudyPilot como um arquivo JSON baixável.
 */
export function exportDataAsJSON(): void {
  if (typeof window === 'undefined') return;

  const { blocks, tracks } = loadStoredData();
  const backup: ExportBackupData = {
    version: '1.0.0',
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
  a.download = `studypilot_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importa e valida um backup JSON previamente salvo.
 */
export function importDataFromJSON(fileContent: string): {
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
      : [mockTrack];

    saveBlocks(blocks);
    saveTracks(tracks);

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
