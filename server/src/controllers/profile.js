import connectNeonDB from "../db/connectNeonDB.js";

const USER_FULL_INFO_QUERY = `
  SELECT
    u.id AS user_id, u.email, u.password, u.first_name, u.last_name, u.avatar,
    u.street, u.house_number, u.city, u.country, u.skills,
    uf.travel_time, uf.least_transfers,
    j.id AS job_id, j.date_posted, j.title, j.organization, j.organization_url,
    j.employment_type, j.url, j.organization_logo, j.display_location,
    j.work_mode, j.seniority, j.description_text, j.normalized_description
  FROM users u
  LEFT JOIN user_favorites uf ON u.id = uf.user_id
  LEFT JOIN jobs j ON uf.job_id = j.id
`;

async function updateUserProfile(user_id, fieldsToUpdate) {
  let setParts = [];
  let values = [];
  let i = 1;

  for (const key in fieldsToUpdate) {
    if (fieldsToUpdate[key] !== undefined) {
      let value = fieldsToUpdate[key];

      if (key === "skills") {
        if (Array.isArray(value)) value = value.join(",");
        else if (value === null) value = null;
        else value = String(value);
      }

      setParts.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }

  if (setParts.length === 0) throw new Error("No fields provided to update");

  values.push(user_id);
  const updateUserIdIndex = i;
  const updateQuery = `
    UPDATE users
    SET ${setParts.join(", ")}
    WHERE id = $${updateUserIdIndex}
  `;

  const { connectedClient, endConnection, error } = await connectNeonDB();
  if (error) throw new Error("DB connection error");

  try {
    await connectedClient.query(updateQuery, values);

    const fetchQuery = `${USER_FULL_INFO_QUERY} WHERE u.id = $1`;
    const result = await connectedClient.query(fetchQuery, [user_id]);

    if (result.rows.length === 0) {
      throw new Error("User not found after update");
    }

    const rows = result.rows;
    const userDataRow = rows[0];

    const updatedUser = {
      id: userDataRow.user_id,
      email: userDataRow.email,
      first_name: userDataRow.first_name,
      last_name: userDataRow.last_name,
      avatar: userDataRow.avatar,
      street: userDataRow.street,
      house_number: userDataRow.house_number,
      city: userDataRow.city,
      country: userDataRow.country,
      skills: userDataRow.skills
        ? userDataRow.skills.split(",").map((skill) => skill.trim())
        : [],
      favorites: [],
    };

    rows.forEach((row) => {
      if (row.job_id) {
        const jobFavorite = {
          id: row.job_id,
          date_posted: row.date_posted,
          title: row.title,
          organization: row.organization,
          organization_url: row.organization_url,
          employment_type: row.employment_type,
          url: row.url,
          organization_logo: row.organization_logo,
          display_location: row.display_location,
          work_mode: row.work_mode,
          seniority: row.seniority,
          description_text: row.description_text,
          travel_time: row.travel_time,
          least_transfers: row.least_transfers,
          normalized_description: row.normalized_description,
        };
        updatedUser.favorites.push(jobFavorite);
      }
    });

    return updatedUser;
  } finally {
    if (endConnection) await endConnection();
  }
}

export default updateUserProfile;
