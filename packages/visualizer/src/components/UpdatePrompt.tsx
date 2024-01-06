import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const onUpdateDismissed = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  useEffect(() => {
    if (offlineReady) {
      toast('Ready for offline usage', { duration: 10000 })
      return
    }
    if (!needRefresh) {
      return
    }
    toast('Update available', {
      action: {
        label: 'Reload',
        onClick: () => updateServiceWorker(true),
      },
      duration: 60000,
      onDismiss: () => onUpdateDismissed(),
      onAutoClose: () => onUpdateDismissed(),
    })
  }, [offlineReady, needRefresh])

  return null
}
