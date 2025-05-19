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
export async function registerUser(userData) {
    // First check if email already exists
    const checkEmailQuery = `
        SELECT user_id FROM users WHERE email = $1;
    `;
    
    try {
        // Check if email exists
        const emailCheck = await executeQuery(checkEmailQuery, [userData.email]);
        if (emailCheck) {
            throw new Error('Пользователь с такой почтой уже зарегистрирован');
        }

        // If email doesn't exist, proceed with registration
        const registerQuery = `
            INSERT INTO users (email, password, name, surname, patronymic, phone, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, false)
            RETURNING user_id, email, is_admin;
        `;
        
        const results = await executeQuery(registerQuery, [
            userData.email,
            userData.password,
            userData.name,
            userData.surname,
            userData.patronymic,
            userData.phone
        ]);
        
        if (results) {
            const secret = process.env.SECRET_TOKEN_JWT;
            const payload = {
                userId: results.user_id,
                username: results.email,
                role: results.is_admin
            };
            const token = jwt.sign(payload, secret);
            return token;
        } else {
            throw new Error('Registration failed');
        }
    } catch (err) {
        console.error("Registration error:", err);
        // Return the specific error message to be displayed to the user
        return { error: err.message };
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