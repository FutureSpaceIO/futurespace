
export default {
  up(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration
      .addColumn('passports', 'deleted_at', {
        type: DataTypes.DATE
      })
      .complete(done);
  },

  down(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration
      .removeColumn('passports', 'deleted_at')
      .complete(done);
  }
};
