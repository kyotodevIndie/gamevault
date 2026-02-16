exports.up = (pgm) => {
  pgm.createType('game_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'])

  pgm.createTable('games', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    developer_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    slug: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    short_description: {
      type: 'varchar(500)',
      notNull: false,
    },
    price: {
      type: 'numeric(10,2)',
      notNull: true,
      default: 0,
    },
    status: {
      type: 'game_status',
      notNull: true,
      default: 'DRAFT',
    },
    cover_url: {
      type: 'varchar(500)',
      notNull: false,
    },
    banner_url: {
      type: 'varchar(500)',
      notNull: false,
    },
    tags: {
      type: 'text[]',
      notNull: true,
      default: pgm.func("'{}'::text[]"),
    },
    platforms: {
      type: 'text[]',
      notNull: true,
      default: pgm.func("'{}'::text[]"),
    },
    download_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    average_rating: {
      type: 'numeric(3,2)',
      notNull: true,
      default: 0,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  })

  pgm.createIndex('games', 'developer_id')
  pgm.createIndex('games', 'status')
  pgm.createIndex('games', 'slug')
  pgm.createIndex('games', 'tags', { method: 'gin' })

  // SQL raw para o índice trgm
  pgm.sql(`
    CREATE INDEX games_title_trgm_index 
    ON games USING gin (title gin_trgm_ops)
  `)
}

exports.down = (pgm) => {
  pgm.dropTable('games')
  pgm.dropType('game_status')
}