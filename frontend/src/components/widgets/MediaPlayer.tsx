import { useHaEntity } from '../../hooks/useHaEntities';
import { callService } from '../../api/client';
import Icon from '@mdi/react';
import {
  mdiPlay,
  mdiPause,
  mdiSkipNext,
  mdiSkipPrevious,
  mdiVolumeHigh,
  mdiVolumeMute,
  mdiTelevision,
} from '@mdi/js';
import type { WidgetProps } from '../../types/widget';

export default function MediaPlayer({ config, mode }: WidgetProps) {
  const { entity } = useHaEntity(config.entityId);

  if (!entity) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-card"
        style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }}>
        {config.entityId ? 'Loading...' : 'No entity'}
      </div>
    );
  }

  const attrs = entity.attributes;
  const state = entity.state; // playing, paused, idle, off, standby
  const isPlaying = state === 'playing';
  const isOff = state === 'off' || state === 'standby';
  const title = (attrs.media_title as string) || '';
  const artist = (attrs.media_artist as string) || '';
  const volume = (attrs.volume_level as number) ?? 0;
  const isMuted = (attrs.is_volume_muted as boolean) || false;
  const source = (attrs.source as string) || '';
  const sources = (attrs.source_list as string[]) || [];
  const entityPic = attrs.entity_picture as string | undefined;

  const label = String(config.label || attrs.friendly_name || config.entityId || 'Media');

  const svc = async (service: string, data?: Record<string, unknown>) => {
    if (mode === 'edit' || !config.entityId) return;
    try {
      await callService('media_player', service, { entity_id: config.entityId, ...data });
    } catch (e) {
      console.error('[MediaPlayer]', e);
    }
  };

  return (
    <div className="flex flex-col w-full h-full rounded-card p-3 overflow-hidden"
      style={{ background: 'var(--color-surface-secondary)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Icon path={mdiTelevision} size={0.6} color="var(--color-accent)" />
        <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <span className="ml-auto text-xs capitalize" style={{ color: 'var(--color-text-tertiary)' }}>{state}</span>
      </div>

      {/* Now playing */}
      <div className="flex items-center gap-3 flex-1 min-h-0">
        {entityPic && !isOff && (
          <img
            src={entityPic}
            alt=""
            className="w-12 h-12 rounded-lg object-cover shrink-0"
            style={{ background: 'var(--color-surface-tertiary)' }}
          />
        )}
        <div className="min-w-0 flex-1">
          {title ? (
            <>
              <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{title}</div>
              {artist && <div className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{artist}</div>}
            </>
          ) : (
            <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {isOff ? 'Off' : 'Nothing playing'}
            </div>
          )}
        </div>
      </div>

      {/* Transport controls */}
      {!isOff && (
        <div className="flex items-center justify-center gap-3 my-2">
          <button onClick={() => svc('media_previous_track')} disabled={mode === 'edit'} className="p-1 transition-opacity hover:opacity-80">
            <Icon path={mdiSkipPrevious} size={0.8} color="var(--color-text-secondary)" />
          </button>
          <button onClick={() => svc(isPlaying ? 'media_pause' : 'media_play')} disabled={mode === 'edit'}
            className="p-2 rounded-full transition-colors"
            style={{ background: 'var(--color-accent)', color: 'white' }}>
            <Icon path={isPlaying ? mdiPause : mdiPlay} size={0.9} color="white" />
          </button>
          <button onClick={() => svc('media_next_track')} disabled={mode === 'edit'} className="p-1 transition-opacity hover:opacity-80">
            <Icon path={mdiSkipNext} size={0.8} color="var(--color-text-secondary)" />
          </button>
        </div>
      )}

      {/* Volume */}
      {!isOff && (
        <div className="flex items-center gap-2">
          <button onClick={() => svc('volume_mute', { is_volume_muted: !isMuted })} disabled={mode === 'edit'}>
            <Icon path={isMuted ? mdiVolumeMute : mdiVolumeHigh} size={0.6} color="var(--color-text-tertiary)" />
          </button>
          <input
            type="range" min={0} max={1} step={0.02}
            value={volume}
            onChange={(e) => svc('volume_set', { volume_level: parseFloat(e.target.value) })}
            disabled={mode === 'edit'}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${volume * 100}%, var(--color-surface-tertiary) ${volume * 100}%, var(--color-surface-tertiary) 100%)`,
              accentColor: 'var(--color-accent)',
            }}
          />
          <span className="text-xs w-8 text-right" style={{ color: 'var(--color-text-tertiary)' }}>{Math.round(volume * 100)}%</span>
        </div>
      )}

      {/* Source selector */}
      {sources.length > 0 && !isOff && (
        <div className="mt-1">
          <select
            value={source}
            onChange={(e) => svc('select_source', { source: e.target.value })}
            disabled={mode === 'edit'}
            className="w-full text-xs py-1 px-2 rounded outline-none cursor-pointer"
            style={{ background: 'var(--color-surface-tertiary)', color: 'var(--color-text-secondary)', border: 'none' }}
          >
            {sources.map((s) => (
              <option key={s} value={s} style={{ background: 'var(--color-surface-primary)' }}>{s}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
