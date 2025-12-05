import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Made with</span>
          <span className="text-red-500">❤️</span>
          <span>by</span>
          <Link
            href="https://tushar-bhardwaj.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Tushar Bhardwaj
          </Link>
        </div>
      </div>
    </footer>
  )
}

