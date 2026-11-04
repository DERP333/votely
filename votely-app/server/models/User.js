const { db } = require('../config/db');

class User {
  static async find(query = {}) {
    let list = db.data.users || [];
    if (query.email) {
      list = list.filter(u => u.email.toLowerCase() === query.email.toLowerCase());
    }
    return list;
  }

  static async findOne(query = {}) {
    const list = await this.find(query);
    return list[0] || null;
  }

  static async findById(id) {
    const user = (db.data.users || []).find(u => u.id === id);
    return user || null;
  }

  static async create(userData) {
    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name,
      gender: userData.gender,
      mobile: userData.mobile,
      email: userData.email.toLowerCase(),
      voterId: userData.voterId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.data.users.push(newUser);
    db.save();
    return newUser;
  }

  static async findByIdAndUpdate(id, updateData, options = { new: true }) {
    const index = (db.data.users || []).findIndex(u => u.id === id);
    if (index === -1) return null;

    db.data.users[index] = {
      ...db.data.users[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    db.save();
    return db.data.users[index];
  }

  static async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }
}

module.exports = User;

