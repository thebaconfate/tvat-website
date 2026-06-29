import { database } from "@/lib/database";
import type { NewUserData, UserData } from "@/lib/domain/users";

type UserDataWithPassword = UserData & { password: string };

class UserService {
  async rootExists(): Promise<boolean> {
    const query = `
    SELECT 1
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name = 'root'
    LIMIT 1
    `;
    const result = await database.query(query);
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async createUser(newUser: NewUserData) {
    const query = `
    WITH new_user AS (
        INSERT INTO users (
            email,
            password,
            first_name,
            last_name
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, first_name, last_name
    ),
    inserted_role AS (
        INSERT INTO user_roles (user_id, role_id)
        SELECT
            u.id,
            (SELECT r.id FROM roles r WHERE r.name = $5)
        FROM new_user u
        RETURNING user_id
    )
    SELECT
        u.id,
        u.email,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        $5 AS role
    FROM new_user u;
    `;
    const params = [
      newUser.email,
      newUser.password,
      newUser.firstName,
      newUser.lastName ?? null,
      newUser.role,
    ];
    const result = await database.query<UserData>(query, params);
    const [user] = result.rows;
    return user ?? null;
  }
  async getUserById(userId: number): Promise<UserData | null> {
    const query = `
    SELECT
        u.id,
        u.email,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        r.name AS role
    FROM users
    JOIN roles r ON r.id = u.role_id
    WHERE id = $1
    LIMIT 1;
    `;
    const result = await database.query<UserData>(query, [userId]);
    const [user] = result.rows;
    return user ?? null;
  }

  async getUserByEmail(email: string): Promise<UserDataWithPassword | null> {
    const query = `
    SELECT
        u.id,
        u.email,
        u.password,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        r.name AS "role"
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    WHERE u.email = $1`;
    const result = await database.query<UserDataWithPassword>(query, [email]);
    const [user] = result.rows;
    return user ?? null;
  }

  async editUser(user: Partial<UserData>) {
    // TODO: implement this
  }
  async deleteUser(userId: number) {
    const sql = `
      DELETE FROM users u WHERE u.id = $1
      `;
    const result = await database.query(sql, [userId]);
    return result;
  }
}

export const userService = new UserService();
