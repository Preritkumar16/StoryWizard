import React, { useState, useRef, useEffect } from 'react';
import { useStory } from '../context/StoryContext';
import { VOICE_LIBRARY_PRESETS } from '../data/mockData';
import { speakStoryContent } from '../utils/audioSynth';
import {
  Headphones,
  Volume2,
  Play,
  Sliders,
  Sparkles,
  Music,
  Check,
  Bot,
  Scroll,
  TreePine,
  Mic,
  Square
} from 'lucide-react';

export const VoiceLibrary: React.FC = () => {
  const { currentUser, updateUserPreferences, triggerCelebration } = useStory();
  const [selectedVoiceId, setSelectedVoiceId] = useState(currentUser.preferences.voiceId || 'grandpa-oak');
  const [speechRate, setSpeechRate] = useState(currentUser.preferences.playbackSpeed || 1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Soundscape track
  const [ambientSound, setAmbientSound] = useState(currentUser.preferences.ambientSound || 'enchanted-forest');
  const [ambientVolume, setLocalAmbientVolume] = useState(currentUser.preferences.ambientVolume ?? 0.3);

  // Student Recording Studio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const stopSpeechRef = useRef<(() => void) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio wave visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isActive = isPreviewing || isRecording || ambientSound !== 'none';
      const bars = 26;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const freqMultiplier = isActive ? Math.sin(phase + i * 0.35) * 0.5 + 0.5 : 0.08;
        const height = Math.max(4, freqMultiplier * (canvas.height - 8));
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#4F46E5');
        gradient.addColorStop(1, '#14B8A6');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, height, [4]);
        ctx.fill();
      }

      phase += isActive ? 0.09 : 0.01;
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPreviewing, isRecording, ambientSound]);

  const handleTestVoice = (voiceId: string) => {
    if (stopSpeechRef.current) {
      stopSpeechRef.current();
    }

    const preset = VOICE_LIBRARY_PRESETS.find(p => p.id === voiceId);
    if (!preset) return;

    setIsPreviewing(true);
    stopSpeechRef.current = speakStoryContent(preset.sampleText, {
      voiceId: preset.id,
      pitch: speechPitch * preset.pitch,
      rate: speechRate * preset.rate,
      onEnd: () => setIsPreviewing(false),
    });
  };

  const handleApplyPreset = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    updateUserPreferences({
      voiceId,
      playbackSpeed: speechRate,
    });
    handleTestVoice(voiceId);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioUrl(URL.createObjectURL(blob));
        triggerCelebration();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone unavailable or permission denied', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
  };

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'TreePine':
        return <TreePine className="h-5 w-5 text-amber-700" />;
      case 'Sparkles':
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      case 'Bot':
        return <Bot className="h-5 w-5 text-teal-600" />;
      case 'Scroll':
        return <Scroll className="h-5 w-5 text-indigo-600" />;
      default:
        return <Volume2 className="h-5 w-5 text-indigo-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <Headphones className="h-4 w-4" />
              <span>Acoustic Reading Engine</span>
              <span aria-hidden="true">·</span>
              <span>AI Story Narration Personas</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-headline">
              Voice Library & Studio
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Choose your favorite AI narrator persona and customize speech cadence for your reading adventures.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm flex items-center gap-3">
            <canvas ref={canvasRef} width={200} height={40} className="rounded bg-slate-50" />
            <div className="text-[11px] text-slate-500 pr-2">
              <span className="block font-semibold text-slate-800">
                {isPreviewing ? 'Playing Sample' : 'Voice Idle'}
              </span>
              <span>{Math.round(speechRate * 100)}% Cadence</span>
            </div>
          </div>
        </div>

        {/* Studio Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: 4 Voice Personas (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-headline">
                  Narrator Persona Roster
                </h2>
                <p className="text-xs text-slate-500">
                  Select a voice to read your stories aloud in the Interactive Reader
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {VOICE_LIBRARY_PRESETS.map((preset) => {
                  const isSelected = selectedVoiceId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {renderIcon(preset.avatarIcon)}
                            <h3 className="text-sm font-bold text-slate-900 font-headline">
                              {preset.name}
                            </h3>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="block text-[11px] font-medium text-indigo-600">
                          {preset.subtitle}
                        </span>
                        <p className="text-xs text-slate-600 leading-snug">
                          {preset.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleTestVoice(preset.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyPreset(preset.id)}
                          className={`text-xs px-3 py-1 rounded-md font-bold transition ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Use Voice'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cadence & Pitch Sliders */}
            <div className="rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 font-headline">
                  Voice Pacing & Pitch Modulator
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">Narration Speed</span>
                    <span className="font-mono text-indigo-600 font-bold tabular-nums">
                      {speechRate.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.4"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSpeechRate(val);
                      updateUserPreferences({ playbackSpeed: val });
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Gentle (0.75x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Brisk (1.4x)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">Pitch Modulator</span>
                    <span className="font-mono text-indigo-600 font-bold tabular-nums">
                      {speechPitch.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Deep</span>
                    <span>Natural</span>
                    <span>High Spirit</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Atmospheric Mixer & Child Narrator Studio (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Ambient Soundscapes */}
            <div className="rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-900 font-headline">
                    Atmospheric Soundscapes
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {ambientSound === 'none' ? 'Muted' : 'Active'}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'enchanted-forest', name: 'Enchanted Woodland', desc: 'Gentle rustling leaves and birdsong' },
                  { id: 'crystal-cavern', name: 'Crystal Cavern Echo', desc: 'Ethereal chimes and soothing water drops' },
                  { id: 'deep-space', name: 'Deep Space Drone', desc: 'Calm harmonic cosmic frequencies' },
                  { id: 'rain-library', name: 'Rainy Day Library', desc: 'Soft rainfall against window panes' },
                ].map((track) => {
                  const isActive = ambientSound === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        const next = isActive ? 'none' : track.id;
                        setAmbientSound(next);
                        updateUserPreferences({ ambientSound: next });
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                        isActive
                          ? 'border-teal-500 bg-teal-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{track.name}</p>
                        <p className="text-[11px] text-slate-500">{track.desc}</p>
                      </div>
                      <div className="pl-3">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-teal-600 text-white' : 'border border-slate-200 text-slate-400'
                        }`}>
                          <Volume2 className="h-3 w-3" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Volume Slider */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Atmosphere Volume</span>
                  <span className="font-mono text-teal-600 font-bold tabular-nums">
                    {Math.round(ambientVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setLocalAmbientVolume(val);
                    updateUserPreferences({ ambientVolume: val });
                  }}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Child Narrator Studio */}
            <div className="rounded-2xl glass-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 font-headline">
                    Record Your Own Voice-Over
                  </h3>
                </div>
                {isRecording && (
                  <span className="text-[11px] font-bold text-rose-600 animate-pulse">
                    REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600">
                Practice reading aloud! Children can record story chapter lines and playback their own reading fluency.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-xs font-bold text-white hover:bg-amber-600 shadow-sm transition"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                    <span>Stop & Save</span>
                  </button>
                )}

                {recordedAudioUrl && (
                  <audio src={recordedAudioUrl} controls className="h-9 w-full sm:w-48 rounded-lg" />
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export const AudioStudio = VoiceLibrary;
