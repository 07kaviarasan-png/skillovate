/**
 * Pagination helper for Mongoose queries.
 * Usage: const { data, pagination } = await paginate(Model, filter, req.query, populateOpts);
 */
const paginate = async (Model, filter = {}, query = {}, populateFields = '') => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  // Sort
  const sortField = query.sort || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  const [data, total] = await Promise.all([
    Model.find(filter)
      .populate(populateFields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Model.countDocuments(filter)
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

module.exports = { paginate };
