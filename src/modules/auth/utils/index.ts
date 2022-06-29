import { CookieOptions } from "express";

export const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week,
    sameSite: process.env.NODE_ENV === 'dev' ? 'none' : 'strict'
}