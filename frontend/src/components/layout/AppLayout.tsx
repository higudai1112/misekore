import Footer from './Footer'

type Props = {
  children: React.ReactNode
}

export function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen pb-16">
      {children}
      <Footer />
    </div>
  )
}