### Phase Navigation

- [1. Initial Setup & Input Validation](1.Initial%20Setup%20&%20Input%20Validation.md)
- [2. Context State Updates](2.Context%20State%20Updates.md)
- [3. Navigation](3.Navigation.md)
- [4.1. Request Validation & Initiation](4.1.Request%20Validation%20&%20Initiation.md)
- [4.2. Client-Side Error Handling](4.2.Client-Side%20Error%20Handling.md)
- [4.3.1. Cache Check for Full String](4.3.1.Cache%20Check%20for%20Full%20String.md)
- [4.3.2. Full Search String Cached](4.3.2.Full%20Search%20String%20Cached.md)
- [4.3.3. Not Cached for Full String](4.3.3.Not%20Cached%20for%20Full%20String.md)
- [4.4. Server-Network Error Handling](4.4.Server-Network%20Error%20Handling.md)
- [4.5. Background Scraper Fetch](4.5.Background%20Scraper%20Fetch.md)
- [5. Travel Details Fetch](5.Travel%20Details%20Fetch.md)
- [6. Display Results](6.Display%20Results.md)

```mermaid
flowchart TD
    %% External Entities
    User([👤 User])
    DB[(🗄️ PostgreSQL<br/>Database)]
    RapidAPI[🌐 RapidAPI<br/>Job Provider]
    ApifyAPI[🌐 Apify API<br/>LinkedIn Scraper]
    GoogleMaps[🌐 Google Maps API<br/>Travel Data]

    %% Main Flow
    User --> A[User enters search text]
    A --> B{Validate cleaned input}

    subgraph Validation["<a href='./1.Initial%20Setup%20&%20Input%20Validation.md'>1.Initial Setup & Input Validation</a>"]
        B -->|Invalid| C[Show AlertMessage<br/>stop search]
    end

    B -->|Valid| D["<a href='./2.Context%20State%20Updates.md'>2.Context State Updates</a>"]
    D --> E["<a href='./3.Navigation.md'>3.Navigation</a>"]
    E --> F["<a href='./4.1.Request%20Validation%20&%20Initiation.md'>4.1.Request Validation & Initiation</a>"]

    subgraph JobSearch["4.Job Search, Cache, Fetch"]
        F --> G{DB connect<br/>+ search_string present?}
        G -->|No| H["<a href='./4.2.Client-Side%20Error%20Handling.md'>4.2.Client-Side Error Handling</a>"]
        G -->|Yes| I["<a href='./4.3.1.Cache%20Check%20for%20Full%20String.md'>4.3.1.Cache Check for Full String</a>"]

        %% Database interactions
        G -.->|Query cache| DB
        I -.->|Query cache| DB

        I --> J[Seed aggregated jobs<br/>from cached full string]
        I --> K{Full string cached<br/>and marked is_whole_string?}
        K -->|Yes| L[Skip background scraper<br/>continue with word loop]
        K -->|No| M{Authenticated user?}
        M -->|Yes| N["<a href='./4.5.Background%20Scraper%20Fetch.md'>4.5.Background Scraper Fetch</a>"]
        M -->|No| L

        %% External API interactions
        N -.->|Fetch jobs| ApifyAPI
        N -.->|Store results| DB

        J --> O[Split search_string into words]
        O --> P[For each word: cache lookup → RapidAPI fetch if miss<br/>dedupe aggregated jobs]
        P -.->|Query cache| DB
        P -.->|Fetch jobs| RapidAPI
        P -.->|Store results| DB
        P --> Q["<a href='./4.3.Search%20Processing%20&%20Results%20Aggregation.md'>4.3.Search Processing & Results Aggregation</a>"]
        Q --> R{Response success?}
        R -->|No| H
    end

    R -->|Yes| S["<a href='./5.Travel%20Details%20Fetch.md'>5.Travel Details Fetch</a>"]
    S -.->|Calculate travel times| GoogleMaps
    S --> T["<a href='./6.Display%20Results.md'>6.Display Results</a>"]
    H --> T
    C --> T
    T --> User

    %% Styling
    style User fill:#e1f5ff,stroke:#01579b,stroke-width:3px,color:#000
    style DB fill:#fff9c4,stroke:#f57f17,stroke-width:3px,color:#000
    style RapidAPI fill:#fff9c4,stroke:#f57f17,stroke-width:3px,color:#000
    style ApifyAPI fill:#fff9c4,stroke:#f57f17,stroke-width:3px,color:#000
    style GoogleMaps fill:#fff9c4,stroke:#f57f17,stroke-width:3px,color:#000
    style A fill:#4a9eff,stroke:#fff,color:#fff
    style B fill:#ff6b6b,stroke:#4a9eff,color:#fff
    style C fill:#ff6b6b,stroke:#4a9eff,color:#fff
    style D fill:#647850,stroke:#4a9eff,color:#fff
    style E fill:#96783c,stroke:#4a9eff,color:#fff
    style F fill:#647850,stroke:#4a9eff,color:#fff
    style G fill:#ff6b6b,stroke:#4a9eff,color:#fff
    style I fill:#647850,stroke:#4a9eff,color:#fff
    style K fill:#ff6b6b,stroke:#4a9eff,color:#fff
    style M fill:#ff6b6b,stroke:#4a9eff,color:#fff
    style N fill:#96783c,stroke:#4a9eff,color:#fff
    style O fill:#96783c,stroke:#4a9eff,color:#fff
    style P fill:#96783c,stroke:#4a9eff,color:#fff
    style Q fill:#647850,stroke:#4a9eff,color:#fff
    style R fill:#ff6b6b,stroke:#4a9eff,color:#fff
    style S fill:#787846,stroke:#4a9eff,color:#fff
    style T fill:#4a9eff,stroke:#fff,color:#fff
```
