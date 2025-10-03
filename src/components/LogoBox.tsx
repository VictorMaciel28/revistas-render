import logoDark from '@/assets/images/logo-dark.png'
import logoSm from '@/assets/images/logo-sm.png'
import Image from 'next/image'
import Link from 'next/link'

const LogoBox = () => {
  return (
    <div className="logo-box">
      <Link href="/dashboards/analytics" className="logo-dark">
        <Image width={28} height={28} src={logoSm} className="logo-sm" alt="logo sm" />
        <Image width={118} height={30} src={logoDark} className="logo-lg rounded" alt="logo dark" />
      </Link>
    </div>
  )
}

export default LogoBox
