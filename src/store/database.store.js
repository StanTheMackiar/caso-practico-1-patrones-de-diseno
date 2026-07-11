const tables = {
  faculties: [], professors: [], courses: [], students: [], projects: [], evaluations: []
};

export const database = {
  listRows(tableName) {
    return tables[tableName];
  },
  insertRow(tableName, row) {
    tables[tableName].push(row);
  },
  findRow(tableName, id) {
    return tables[tableName].find((row) => row.id === id);
  },
  updateRow(tableName, id, newRow) {
    const index = tables[tableName].findIndex((row) => row.id === id);
    tables[tableName][index] = newRow;
  }
};
