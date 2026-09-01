import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://backend-fintrack-gules.vercel.app";
const COOKIE_NAME = process.env.COOKIE_NAME || "fintrack_session";

export async function PUT(req, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_API_URL}/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.error || errorData.message || "Backend error" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error (PUT categories):", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const backendRes = await fetch(`${BACKEND_API_URL}/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.error || errorData.message || "Failed to delete category" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error (DELETE categories):", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
