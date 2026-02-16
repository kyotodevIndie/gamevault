/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createExtension('uuid-ossp', { ifNotExists: true })

  pgm.createType('user_role', ['USER', 'DEVELOPER', 'ADMIN'])

  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: false,
    },
    role: {
      type: 'user_role',
      notNull: true,
      default: 'USER',
    },
    avatar_url: {
      type: 'varchar(500)',
      notNull: false,
    },
    is_verified: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
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

  // Índices
  pgm.createIndex('users', 'email')
  pgm.createIndex('users', 'role')
}

exports.down = (pgm) => {
  pgm.dropTable('users')
  pgm.dropType('user_role')
}