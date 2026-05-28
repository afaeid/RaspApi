class ApiFeatures {
 constructor(query, reqQuery, req) {
  this.query = query;
  this.reqQuery = reqQuery;
  this.req = req
 }
 filter() {

  this.reqQuery = JSON.stringify(this.reqQuery)
  this.reqQuery = this.reqQuery.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`)
  this.reqQuery = JSON.parse(this.reqQuery)
  this.query = this.query.find(this.reqQuery);
  
  delete this.query._conditions.sort
  delete this.query._conditions.fields
  delete this.query._conditions.limit
  delete this.query._conditions.page

  return this;
 }
 sort() {
  this.query = this.query.sort(this.reqQuery.sort ? this.reqQuery.sort.split(",").join(" ") : "-createdAt price")

  return this;
 }
 projection() {
  this.query = this.query.select(this.reqQuery.fields ? this.reqQuery.fields.split(",").join(" ") : "-__v -createdBy");

  return this;
 }
 paginate() {

  const page = this.reqQuery.page * 1 || 1;
  const limit = this.reqQuery.limit * 1 || this.req.moviesCount;
  const skip = (page - 1) * limit
  this.query = this.query.skip(skip).limit(limit)


  if (this.reqQuery.page) {
   if (skip >= this.req.moviesCount) {
    throw new Error("This page is not found")
   }
  }

  return this;
 }
}


module.exports = ApiFeatures;
