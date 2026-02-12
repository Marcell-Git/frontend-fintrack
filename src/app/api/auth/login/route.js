import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:7000";
const COOKIE_NAME = process.env.COOKIE_NAME || "fintrack_session";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const backendRes = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const data = await backendRes.json();
    const token = data.token;
    const user = data.user;

    const cookieStore = await cookies();
    
    // DEBUG: Log token generation (Remove in production if sensitive)
    // console.log("Setting cookie for user:", user.username);
    
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "strict", // Revert to strict for better security
      path: "/",
      maxAge: 3600, 
    });

    return NextResponse.json({ user, token }); // Return token for client-side storage
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
