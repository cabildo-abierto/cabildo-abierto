import { NextRequest, NextResponse } from "next/server";

async function unsubscribe(token: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/unsubscribe/${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ source: "one-click" }),
        cache: "no-store",
    });

    const json = await res.json()

    if (!res.ok || json.error != null) {
        throw new Error(`Backend unsubscribe failed: ${res.status}`);
    }
}

export async function POST(
    _req: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        await unsubscribe(params.code);
        return new NextResponse(null, { status: 200 });
    } catch {
        return new NextResponse(null, { status: 500 });
    }
}


export async function GET(
    _req: NextRequest,
    { params }: { params: { code: string } }
) {
    let ok = true;

    try {
        await unsubscribe(params.code);
    } catch {
        ok = false;
    }

    const html = `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${ok ? "Desuscripción confirmada" : "Error al desuscribirse"} – Cabildo Abierto</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: #fafafa;
      color: #222;
      margin: 0;
      padding: 0;
    }
    main {
      max-width: 560px;
      margin: 64px auto;
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,.06);
    }
    h1 {
      font-size: 22px;
      margin: 0 0 12px;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px;
    }
    a {
      color: #1a1a2e;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <main>
    ${
        ok
            ? `
      <h1>Ya no vas a recibir estos correos</h1>
      <p>
        Te desuscribiste correctamente de las novedades de Cabildo Abierto.
      </p>
      <p>
        Si fue un error, podés volver a suscribirte desde tu cuenta.
      </p>
      `
            : `
      <h1>No pudimos procesar la desuscripción</h1>
      <p>
        Puede que el enlace esté vencido o ya haya sido utilizado.
      </p>
      `
    }
    <p>
      <a href="https://cabildoabierto.ar">Volver a Cabildo Abierto</a>
    </p>
  </main>
</body>
</html>
`;

    return new NextResponse(html, {
        status: ok ? 200 : 400,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}