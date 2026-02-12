import { NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:7000";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const backendRes = await fetch(`${BACKEND_API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message || "Registration failed" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
