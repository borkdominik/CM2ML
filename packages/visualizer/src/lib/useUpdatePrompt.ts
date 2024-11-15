import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function useUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (offlineReady) {
      toast('Ready for offline usage')
      return
    }
    if (!needRefresh) {
      return
    }
    const onUpdateDismissed = () => {
      setOfflineReady(false)
      setNeedRefresh(false)
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
  }, [offlineReady, needRefresh, updateServiceWorker, setNeedRefresh, setOfflineReady])
}
