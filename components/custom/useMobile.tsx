import { useState, useEffect } from 'react'

export enum DeviceType {
    Mobile = 0,
    Tablet = 1,
    Desktop = 2
}

const useMobile = () => {
    const [device, setDevice] = useState<null | DeviceType>(null)

    useEffect(() => {
        const handleDeviceDetection = () => {
            const userAgent = navigator.userAgent.toLowerCase()
            const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent)
            const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent)

            if (isMobile) {
                setDevice(DeviceType.Mobile)
            } else if (isTablet) {
                setDevice(DeviceType.Tablet)
            } else {
                setDevice(DeviceType.Desktop)
            }
        }

        handleDeviceDetection()
        window.addEventListener('resize', handleDeviceDetection)

        return () => {
            window.removeEventListener('resize', handleDeviceDetection)
        }
    }, [])

    return device
}

export default useMobile