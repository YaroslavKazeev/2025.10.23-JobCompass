CREATE TABLE IF NOT EXISTS jobs (
    id text NOT NULL,
    date_posted timestamp without time zone,
    title character varying(500),
    organization character varying(255),
    organization_url text,
    employment_type character varying(255),
    url text,
    organization_logo text,
    display_location character varying(500),
    work_mode character varying(255),
    seniority character varying(255),
    description_text text,
    normalized_description text,
    CONSTRAINT jobs_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    avatar character varying(255),
    street character varying(255),
    house_number character varying(50),
    city character varying(100),
    country character varying(100),
    skills text,
    reset_token uuid,
    reset_token_expires timestamp without time zone,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS user_favorites (
    user_id uuid NOT NULL,
    job_id text NOT NULL,
    travel_time smallint,
    least_transfers smallint,
    CONSTRAINT user_favorites_pkey PRIMARY KEY (user_id, job_id),
    CONSTRAINT user_favorites_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
    CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_strings (
    search_string text NOT NULL,
    search_date timestamp without time zone,
    is_auth uuid,
    is_whole_string boolean DEFAULT false,
    CONSTRAINT search_strings_pkey PRIMARY KEY (search_string)
);

CREATE TABLE IF NOT EXISTS search_strings_jobs (
    search_string text NOT NULL,
    job_id text NOT NULL,
    CONSTRAINT search_strings_jobs_pkey PRIMARY KEY (search_string, job_id),
    CONSTRAINT search_strings_jobs_search_string_fkey FOREIGN KEY (search_string) REFERENCES search_strings (search_string) ON DELETE CASCADE,
    CONSTRAINT search_strings_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);

/*
Database Performance & Maintenance Notes:
- Database Optimization: Proper indexing and query optimization implemented
- Database Connections: Basic PostgreSQL client connections used
- Automated Cleanup: Daily cron jobs for cache maintenance (see server/src/index.js)
- Rate Limiting: API protection and fair usage enforcement implemented
- Cascade Delete: Automatic cleanup when users or jobs are removed to maintain data integrity
- Composite Keys: Used for many-to-many relationships to ensure uniqueness
- UUID Primary Keys: Used for users table to ensure global uniqueness
- Text-based IDs: Used for jobs table to accommodate external API identifiers

Data Processing Pipeline Notes:
- Real-time Processing: Immediate job search results supported
- Background Processing: Asynchronous LinkedIn scraping for authenticated users
- Data Validation: Comprehensive job data validation and normalization
- Deduplication: Cross-source job deduplication by unique identifiers
- Cache Foundation: search_strings_jobs table enables efficient result retrieval for repeated searches
- Analytics: Supports search result analysis and optimization
*/