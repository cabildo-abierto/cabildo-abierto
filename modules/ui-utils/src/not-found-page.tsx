import Link from 'next/link'
import {Button} from "./button";



export const NotFoundPage = () => {
    return <div className="text-center">
      <h2 className="py-16">Error 404</h2>
      <p className="mb-16 text-lg text-[var(--text-light)]">No pudimos encontrar la página.</p>
      <Link href="/inicio">
          <Button
              sx={{textTransform: 'none'}}
              variant={"contained"}
          >
              Volver al inicio
          </Button>
      </Link>
    </div>
}