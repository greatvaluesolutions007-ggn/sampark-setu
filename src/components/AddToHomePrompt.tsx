import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function AddToHomePrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      console.log('onBeforeInstall', e)
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  if (!visible || !deferred) return null

  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center z-50">
      <div className="rounded-full bg-white/90 shadow-lg p-1 border">
        <Button
          onClick={async () => {
            await deferred.prompt()
            try {
            //   const choice = await deferred.userChoice
              // Hide after user's decision
              setVisible(false)
              setDeferred(null)
              // Optional: track choice.outcome
            } catch {
              setVisible(false)
              setDeferred(null)
            }
          }}
          className="px-5"
        >
          ऐप इंस्टॉल करें
        </Button>
      </div>
    </div>
  )
}


