class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // filter the query
  filter() {
    const queryClone = { ...this.queryString };
    const excludeFields = ['page', 'limit', 'sort', 'select'];
    excludeFields.forEach((ele) => delete queryClone[ele]);
    // advanced filter
    let finalQuary = JSON.stringify(queryClone);
    finalQuary = finalQuary.replace(
      /\blt|lte|gt|gte\b/gi,
      (match) => `$${match}`,
    );

    this.query = this.query.find(JSON.parse(finalQuary));
    return this;
  }
  // sort
  sort() {
    if (this.queryString.sort) {
      const sortBY = this.queryString.sort.split(',').join(' ');
      console.log(sortBY);
      this.query = this.query.sort(sortBY);
    } else {
      this.query = this.query.sort('-createdAT');
    }
    return this;
  }
  // select
  select() {
    if (this.queryString.select) {
     const  selectBy = this.queryString.select.split(',').join(' ');
      this.query = this.query.select(selectBy);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  //paginate
  paginage() {
    if (this.queryString.page) {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    } else {
      this.query = this.query.limit(this.queryString.limit * 1);
    }
    return this;
  }
}
module.exports = ApiFeatures;
