"use server"
import { createSessionCookie } from "./cookies";
import connection from "./db";
import jwt from "jsonwebtoken";

async function executeQuery(query, params) {
    let client;
    try {
        client = await connection.connect();
        const result = await connection.query(query, params);
        return result.rows[0];
    } catch (err) {
        console.error("Database error:", err);
        return [];
    } finally {
        if (client) {
            await client.release();
        }
    }

}

export async function checkLogin(login, password) {
    const query = `
    SELECT user_id, email, is_admin FROM users WHERE email = $1 AND password = $2;
    `
    const results = await executeQuery(query, [login, password]);
    if (results) {
        console.log("good job")
        const secret = process.env.SECRET_TOKEN_JWT;
        const payload = {
            userId: results.user_id,
            username: results.email,
            role: results.is_admin
        };
        const token = jwt.sign(payload, secret);
        return token;

    } else {
        return false;
    }

}

export async function GetUserData(id) {
    const query = `
    SELECT email, name, patronymic, surname, phone FROM users WHERE user_id = $1;
    `
    let results = [];
    try{
        console.log(`getting user data ${id}`)
        results = await executeQuery(query, [id]);
        console.log(results, id);
    }
    catch(err){
        console.error("error", err);
    }
    finally{
        console.log(results);
        return results;
    }
    
}

export async function UpdateUserData(id, data) {
    const query = `
    UPDATE users SET email = $1, name = $2, patronymic = $3, surname = $4, phone = $5 WHERE user_id = $6;
    `
    try{
        console.log(`updating user data ${id}`)
        await executeQuery(query, [data.email, data.name, data.patronymic, data.surname, data.phone, id]);
        console.log(id);
    }
    catch(err){
        console.error("error", err);
    }
    
}