import { Suspense, useEffect, useRef, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { onCharacterEvent } from '../utils/characterEvents'

// Animation clip names inside each GLB
const CLIP_NAMES = {
  idle:           'Armature|Idle_12|baselayer',
  dance1:         'Armature|All_Night_Dance|baselayer',
  dance2:         'Armature|OMG_Groove|baselayer',
  dance3:         'Armature|You_Groove|baselayer',
  wake_up:        'Armature|Stand_Up1|baselayer',
  going_to_sleep: 'Armature|sleep|baselayer',
  sleeping:       'Armature|Sleep_Normally|baselayer',
}

const DANCE_CLIPS = [CLIP_NAMES.dance1, CLIP_NAMES.dance2, CLIP_NAMES.dance3]
const FADE_DURATION = 0.3

function CharacterModel() {
  const groupRef = useRef()

  // Load all GLBs
  const idle         = useGLTF('/animations/idle.glb')
  const dance1       = useGLTF('/animations/dance1.glb')
  const dance2       = useGLTF('/animations/dance2.glb')
  const dance3       = useGLTF('/animations/dance3.glb')
  const wakeUp       = useGLTF('/animations/wake_up.glb')
  const goingToSleep = useGLTF('/animations/going_to_sleep.glb')
  const sleeping     = useGLTF('/animations/sleeping.glb')

  // Combine all animation clips
  const allClips = useMemo(() => [
    ...idle.animations,
    ...dance1.animations,
    ...dance2.animations,
    ...dance3.animations,
    ...wakeUp.animations,
    ...goingToSleep.animations,
    ...sleeping.animations,
  ], [idle, dance1, dance2, dance3, wakeUp, goingToSleep, sleeping])

  const { actions, mixer } = useAnimations(allClips, groupRef)
  const currentClipRef = useRef(null)

  const playClip = useCallback((clipName, { loop = true, onFinish } = {}) => {
    const action = actions[clipName]
    if (!action) return

    // Fade out current
    if (currentClipRef.current && actions[currentClipRef.current]) {
      actions[currentClipRef.current].fadeOut(FADE_DURATION)
    }

    action.reset()
    action.fadeIn(FADE_DURATION)

    if (!loop) {
      action.setLoop(2200, 1) // THREE.LoopOnce = 2200
      action.clampWhenFinished = true
    } else {
      action.setLoop(2201, Infinity) // THREE.LoopRepeat = 2201
    }

    action.play()
    currentClipRef.current = clipName

    if (onFinish) {
      const handler = (e) => {
        if (e.action === action) {
          mixer.removeEventListener('finished', handler)
          onFinish()
        }
      }
      mixer.addEventListener('finished', handler)
    }
  }, [actions, mixer])

  // On mount: wake_up → idle
  useEffect(() => {
    if (!actions[CLIP_NAMES.wake_up] || !actions[CLIP_NAMES.idle]) return
    playClip(CLIP_NAMES.wake_up, {
      loop: false,
      onFinish: () => playClip(CLIP_NAMES.idle),
    })
  }, [actions, playClip])

  // Listen for character events (dance on task/habit complete)
  useEffect(() => {
    return onCharacterEvent((eventName) => {
      if (eventName === 'task_complete') {
        const randomDance = DANCE_CLIPS[Math.floor(Math.random() * DANCE_CLIPS.length)]
        playClip(randomDance, {
          loop: false,
          onFinish: () => playClip(CLIP_NAMES.idle),
        })
      }
    })
  }, [playClip])

  return (
    <group ref={groupRef}>
      <primitive object={idle.scene} />
    </group>
  )
}

export default function Character3D({ daysMissed, isMobile }) {
  let decayFilter = ''
  if      (daysMissed === 1) decayFilter = 'saturate(0.65) brightness(0.93)'
  else if (daysMissed === 2) decayFilter = 'saturate(0.3) brightness(0.85)'
  else if (daysMissed >= 3)  decayFilter = 'grayscale(1) brightness(0.75)'

  return (
    <div
      style={{
        position:      'fixed',
        bottom:        '64px',
        left:          '50%',
        transform:     'translateX(-50%)',
        height:        isMobile ? '60vh' : '72vh',
        width:         isMobile ? '60vh' : '72vh',
        zIndex:        20,
        pointerEvents: 'none',
        filter:        decayFilter || undefined,
        transition:    'filter 1.5s ease',
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 1, 3], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} color="#ffeedd" />
        <directionalLight position={[2, 3, 2]} intensity={1.0} />
        <Suspense fallback={null}>
          <CharacterModel />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload idle for fastest initial display
useGLTF.preload('/animations/idle.glb')
