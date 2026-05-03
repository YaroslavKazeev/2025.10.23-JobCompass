export function mapUserFavoritesFromRows(rows) {
  const favorites = [];
  rows.forEach((row) => {
    if (row.job_id) {
      favorites.push({
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
        adding_date: row.adding_date,
        normalized_description: row.normalized_description,
      });
    }
  });

  return favorites;
}

export default function mapUserFromJoinRows(
  rows,
  { includeDonation = false } = {},
) {
  const userDataRow = rows[0];

  return {
    id: userDataRow.user_id,
    email: userDataRow.email,
    first_name: userDataRow.first_name,
    last_name: userDataRow.last_name,
    avatar: userDataRow.avatar,
    street: userDataRow.street,
    house_number: userDataRow.house_number,
    city: userDataRow.city,
    country: userDataRow.country,
    skills: userDataRow.skills ? userDataRow.skills.split(",") : [],
    favorites: mapUserFavoritesFromRows(rows),
    ...(includeDonation
      ? {
          time_to_donate:
            userDataRow.number_of_logins + 1 === 5
              ? process.env.DONATION_URL
              : false,
        }
      : {}),
  };
}
