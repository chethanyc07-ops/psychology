import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Square,
  RefreshCw,
  Clock,
} from 'lucide-react';

export type AmbientTrackId = 'rain' | 'brown' | 'lofi';

interface TrackMeta {
  id: AmbientTrackId;
  label: string;
  shortDesc: string;
}

const TRACKS: TrackMeta[] = [
  {
    id: 'rain',
    label: 'Rain on a Window',
    shortDesc: 'Soft rainfall & gentle window patter',
  },
  {
    id: 'brown',
    label: 'Brown Noise',
    shortDesc: 'Deep acoustic masking for study focus',
  },
  {
    id: 'lofi',
    label: 'Soft Lo-Fi',
    shortDesc: 'Warm Rhodes chords & subtle vinyl texture',
  },
];

const DAILY_REMINDERS = [
  'Reminder: One bad exam or rejected application does not define your worth.',
  'Reminder: Resting is part of the work, not the opposite of it. You are allowed to pause.',
  'Reminder: Everyone on campus is figuring things out at their own pace—comparison is a thief of peace.',
  'Reminder: Asking for support is a sign of self-awareness, never a weakness.',
];

export const FooterAudioPlayer: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<AmbientTrackId | null>(null);
  const [volume, setVolume] = useState<number>(0.65);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [resetSecondsLeft, setResetSecondsLeft] = useState<number | null>(null);
  const [reminderIndex, setReminderIndex] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const cleanupTrackRef = useRef<(() => void) | null>(null);

  // Sync volume & mute state with Web Audio master GainNode
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const effectiveGain = isMuted ? 0 : volume;
      masterGainRef.current.gain.setTargetAtTime(
        effectiveGain,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [volume, isMuted]);

  // 60-Second Reset countdown timer when active
  useEffect(() => {
    if (resetSecondsLeft === null || resetSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setResetSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          stopCurrentTrack();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resetSecondsLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTrackRef.current) {
        cleanupTrackRef.current();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const stopCurrentTrack = () => {
    if (cleanupTrackRef.current) {
      cleanupTrackRef.current();
      cleanupTrackRef.current = null;
    }
    setActiveTrack(null);
    setResetSecondsLeft(null);
  };

  const ensureAudioContext = (): { ctx: AudioContext; masterGain: GainNode } | null => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.value = isMuted ? 0 : volume;
      masterGain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    return {
      ctx: audioCtxRef.current,
      masterGain: masterGainRef.current!,
    };
  };

  const startTrack = (trackId: AmbientTrackId) => {
    if (cleanupTrackRef.current) {
      cleanupTrackRef.current();
      cleanupTrackRef.current = null;
    }

    const audio = ensureAudioContext();
    if (!audio) return;
    const { ctx, masterGain } = audio;

    if (trackId === 'rain') {
      // 1. Rain on a Window: Filtered pink/rain wash + subtle window droplet impulses + slow wind swell LFO
      const bufferSize = 3 * ctx.sampleRate;
      const rainBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = rainBuffer.getChannelData(0);

      let b0 = 0,
        b1 = 0,
        b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.963 * b1 + white * 0.2965164;
        b2 = 0.57 * b2 + white * 1.0526913;
        // Occasional soft droplet impulse on windowpane
        const droplet = Math.random() > 0.9985 ? (Math.random() * 2 - 1) * 0.85 : 0;
        data[i] = (b0 + b1 + b2 + white * 0.18) * 0.045 + droplet * 0.12;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = rainBuffer;
      noiseSource.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 920;
      bandpass.Q.value = 0.65;

      // Gentle LFO modulating filter frequency to mimic natural rain breeze against glass
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.14;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 220;
      lfo.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      const trackGain = ctx.createGain();
      trackGain.gain.value = 0.75;

      noiseSource.connect(bandpass);
      bandpass.connect(trackGain);
      trackGain.connect(masterGain);

      noiseSource.start();
      lfo.start();

      cleanupTrackRef.current = () => {
        try {
          noiseSource.stop();
          lfo.stop();
          noiseSource.disconnect();
          lfo.disconnect();
          trackGain.disconnect();
        } catch {
          // ignore
        }
      };
    } else if (trackId === 'brown') {
      // 2. Brown Noise (Study Focus): Deep integrated Brownian noise with warm 280Hz low-pass filter
      const bufferSize = 3 * ctx.sampleRate;
      const brownBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = brownBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 0.26;
      }

      const brownSource = ctx.createBufferSource();
      brownSource.buffer = brownBuffer;
      brownSource.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 260;

      const trackGain = ctx.createGain();
      trackGain.gain.value = 0.85;

      brownSource.connect(lowpass);
      lowpass.connect(trackGain);
      trackGain.connect(masterGain);

      brownSource.start();

      cleanupTrackRef.current = () => {
        try {
          brownSource.stop();
          brownSource.disconnect();
          trackGain.disconnect();
        } catch {
          // ignore
        }
      };
    } else if (trackId === 'lofi') {
      // 3. Soft Lo-Fi: Warm Rhodes chord progression (Fmaj7 -> Em7 -> Dm7 -> Cmaj7) + subtle vinyl warmth
      const chords = [
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [164.81, 196.0, 246.94, 293.66], // Em7
        [146.83, 174.61, 220.0, 261.63], // Dm7
        [130.81, 164.81, 196.0, 246.94], // Cmaj7
      ];

      const padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.value = 680;

      const padGain = ctx.createGain();
      padGain.gain.value = 0.11;
      padFilter.connect(padGain);
      padGain.connect(masterGain);

      // Subtle vinyl dust bed
      const vinylSize = 2 * ctx.sampleRate;
      const vinylBuf = ctx.createBuffer(1, vinylSize, ctx.sampleRate);
      const vData = vinylBuf.getChannelData(0);
      for (let i = 0; i < vinylSize; i++) {
        const crackle = Math.random() > 0.997 ? (Math.random() * 2 - 1) * 0.25 : 0;
        vData[i] = (Math.random() * 2 - 1) * 0.008 + crackle;
      }
      const vinylSource = ctx.createBufferSource();
      vinylSource.buffer = vinylBuf;
      vinylSource.loop = true;

      const vinylFilter = ctx.createBiquadFilter();
      vinylFilter.type = 'bandpass';
      vinylFilter.frequency.value = 1800;

      const vinylGain = ctx.createGain();
      vinylGain.gain.value = 0.18;
      vinylSource.connect(vinylFilter);
      vinylFilter.connect(vinylGain);
      vinylGain.connect(masterGain);
      vinylSource.start();

      // Create 4 voice oscillators for smooth chord transitions
      const voices = chords[0].map((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.connect(padFilter);
        osc.start();
        return osc;
      });

      let chordIdx = 0;
      const chordTimer = window.setInterval(() => {
        chordIdx = (chordIdx + 1) % chords.length;
        const targetChord = chords[chordIdx];
        const now = ctx.currentTime;
        voices.forEach((osc, idx) => {
          osc.frequency.setTargetAtTime(targetChord[idx], now, 0.35);
        });
      }, 4200);

      cleanupTrackRef.current = () => {
        window.clearInterval(chordTimer);
        voices.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        });
        try {
          vinylSource.stop();
          vinylSource.disconnect();
          padGain.disconnect();
          vinylGain.disconnect();
        } catch {
          // ignore
        }
      };
    }

    setActiveTrack(trackId);
  };

  const handleToggleTrack = (trackId: AmbientTrackId) => {
    if (activeTrack === trackId) {
      stopCurrentTrack();
    } else {
      startTrack(trackId);
    }
  };

  const handleStart60SecReset = () => {
    if (!activeTrack) {
      startTrack('rain');
    }
    setResetSecondsLeft(60);
  };

  return (
    <section
      aria-label="60-Second Reset Ambient Audio Player"
      className="bg-white/95 backdrop-blur-xl border-t border-[#BAE6FD]/80 py-4 px-4 sm:px-6"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: Audio Track Toggles + Volume & 60s Timer */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 pr-2 text-xs font-bold text-[#0F2942]">
            <Headphones className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>60-Second Reset:</span>
          </div>

          {TRACKS.map((track) => {
            const isPlaying = activeTrack === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleToggleTrack(track.id)}
                aria-pressed={isPlaying}
                title={track.shortDesc}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isPlaying
                    ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-xs'
                    : 'bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0F2942] border-[#BAE6FD]'
                }`}
              >
                {isPlaying ? (
                  <Square className="w-3 h-3 fill-current text-[#99F6E4]" aria-hidden="true" />
                ) : (
                  <Play className="w-3 h-3 fill-current text-[#0D9488]" aria-hidden="true" />
                )}
                <span>{track.label}</span>
              </button>
            );
          })}

          {/* Volume & 60s Timer Controls */}
          <div className="inline-flex items-center gap-2 pl-1 sm:pl-2 border-l border-[#BAE6FD]">
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              aria-label={isMuted ? 'Unmute ambient audio' : 'Mute ambient audio'}
              className="p-1.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0F2942] cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-[#0284C7]" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#0D9488]" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              aria-label="Ambient audio volume"
              className="w-20 accent-[#0D9488] cursor-pointer"
            />

            <button
              type="button"
              onClick={handleStart60SecReset}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                resetSecondsLeft !== null
                  ? 'bg-[#F0FDFA] text-[#0D9488] border-[#99F6E4]'
                  : 'bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#47627B] border-[#BAE6FD]'
              }`}
            >
              <Clock className="w-3 h-3 text-[#0D9488]" aria-hidden="true" />
              <span>
                {resetSecondsLeft !== null ? `${resetSecondsLeft}s Reset` : '60s Timer'}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Daily Affirmation / Reminder */}
        <div className="flex items-center justify-between xl:justify-end gap-3 pt-2 xl:pt-0 border-t xl:border-t-0 border-[#E0F2FE]">
          <p className="font-editorial italic text-xs sm:text-sm text-[#0F2942]">
            &ldquo;{DAILY_REMINDERS[reminderIndex]}&rdquo;
          </p>
          <button
            type="button"
            onClick={() =>
              setReminderIndex((prev) => (prev + 1) % DAILY_REMINDERS.length)
            }
            aria-label="Show another daily reminder"
            title="Show another reminder"
            className="p-1.5 rounded-full bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] hover:text-[#0F2942] shrink-0 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
