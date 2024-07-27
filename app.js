// Importing Third Party Packages
const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const {format, isMatch} = require('date-fns')

// Express Instance
const app = express()
app.use(express.json())

// Getting Database Current File Path
const dbPath = path.join(__dirname, 'todoApplication.db')

// Storing database connection promise object
let db = null

// Database connection and server initalization
const databaseConnection = async (request, response) => {
  // Exception handling for handling database connection errore
  try {
    // Database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    // Assining server port number
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`Datanase Conncetion Error: ${error.message}`)
    process.exit(1)
  }
}
databaseConnection()

// 1.GET Todos Priority Status Category API
app.get(`/todos/`, async (request, response) => {
  const {todo, priority, status, category, search_q} = request.query
  let sqlQuery = null
  switch (true) {
    // GET Todo whose status is 'TO DO'
    case status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        sqlQuery = `
          select
            id,
            todo,
            priority,
            status,
            category,
            due_date as dueDate
          from
            todo
          where 
            status like '%${status}%'
        ;`
        const getTodos = await db.all(sqlQuery)
        response.send(getTodos)
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    // GET Todo whose priority is 'HIGH'
    case priority !== undefined:
      if (priority === 'MEDIUM' || priority === 'HIGH' || priority === 'LOW') {
        sqlQuery = `
          select
            id,
            todo,
            priority,
            status,
            category,
            due_date as dueDate
          from
            todo
          where 
            priority like '%${priority}%'
        ;`
        const getPriority = await db.all(sqlQuery)
        response.send(getPriority)
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    // GET Todo whose priority is 'HIGH' and status is 'IN PROGRESS'
    case status !== undefined && priority !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        if (
          priority === 'MEDIUM' ||
          priority === 'HIGH' ||
          priority === 'LOW'
        ) {
          sqlQuery = `
            select
              id,
              todo,
              priority,
              status,
              category,
              due_date as dueDate
            from
              todo
            where 
              priority like '%${priority}%'
            and
              status like '%${status}%'
          ;`
          const getStatesPriority = await db.all(sqlQuery)
          response.send(getStatesPriority)
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    // GET Todos Whose Todo Contains 'Buy'
    case search_q !== undefined:
      sqlQuery = `
        select
          id,
          todo,
          priority,
          status,
          category,
          due_date as dueDate
        from
          todo
        where
          todo like '%${search_q}%'
      ;`
      const getTodo = await db.all(sqlQuery)
      response.send(getTodo)
      break
    // GET Todos Whose Category is 'WORK' and Status is 'DONE'
    case category !== undefined && status !== undefined:
      if (
        category === 'HOME' ||
        category === 'WORK' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          sqlQuery = `
            select
              *
            from
              todo
            where
              category like '%${category}%'
            and
              status like '%${status}%'
          ;`
          const getTodoCategoryStatus = await db.all(sqlQuery)
          response.send(getTodoCategoryStatus)
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    // GET Todos Whose Category is 'HOME'
    case category !== undefined:
      if (
        category === 'HOME' ||
        category === 'WORK' ||
        category === 'LEARNING'
      ) {
        sqlQuery = `
          select
            id,
            todo,
            priority,
            status,
            category,
            due_date as dueDate
          from
            todo
          where
            category like '%${category}%'
        ;`
        const getTodoCategory = await db.all(sqlQuery)
        response.send(getTodoCategory)
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    // GET Todos Whose Category is 'LEARNING' and Priority is 'HIGH'
    case category !== undefined && priority !== undefined:
      if (
        category === 'HOME' ||
        category === 'WORK' ||
        category === 'LEARNING'
      ) {
        if (
          priority === 'MEDIUM' ||
          priority === 'HIGH' ||
          priority === 'LOW'
        ) {
          sqlQuery = `
            select
              *
            from
              todo
            where
              category like '%${category}%'
            and
              priority like '%${priority}%'
          ;`
          const getTodoCategoryPriority = await db.all(sqlQuery)
          response.send(getTodoCategoryPriority)
        } else {
          response.status(400)
          response.send('Invalid Todo Category')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    // GET Todos
    default:
      sqlQuery = `
        select
          *
        from
          todo
      ;`
      const getTodos = await db.all(sqlQuery)
      response.send(getTodos)
  }
})

// 2.GET Todo API
app.get(`/todos/:todoId/`, async (request, response) => {
  const {todoId} = request.params
  const sqlQuery = `
    select
      id,
      todo,
      priority,
      status,
      category,
      due_date as dueDate
    from
      todo
    where
      id = ${todoId}
  ;`
  const getTodo = await db.get(sqlQuery)
  response.send(getTodo)
})

// 3.GET Todos with a specific due date in the query parameter API
// `/agenda/?date=2021-12-12`
app.get(`/agenda/`, async (request, response) => {
  const {date} = request.query
  // Date valid / invalid
  const dateMatch = isMatch(date, 'yyyy-MM-dd')
  if (dateMatch) {
    // Date formationg '2021-1-10' to '2021-01-10'
    const formatDate = format(new Date(date), 'yyyy-MM-dd')
    const sqlQuery = `
      select
        id,
        todo,
        priority,
        status,
        category,
        due_date as dueDate
      from
        todo
      where
        due_date like '%${formatDate}'
    ;`
    const getTodo = await db.all(sqlQuery)
    response.send(getTodo)
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

// 4.Add Todo API
app.post(`/todos/`, async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  // Date valid / invalid
  const dateMatch = isMatch(dueDate, 'yyyy-MM-dd')
  if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (dateMatch) {
          // Date formationg '2021-1-10' to '2021-01-10'
          const formatDate = format(new Date(dueDate), 'yyyy-MM-dd')
          const sqlQuery = `
            insert into
              todo (id,todo,priority,status,category,due_date)
            values (
              ${id},
              '${todo}',
              '${priority}',
              '${status}',
              '${category}',
              '${formatDate}'
            )
          ;`
          await db.run(sqlQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})

// 5.Update Todo API
app.put(`/todos/:todoId/`, async (request, response) => {
  const {todoId} = request.params
  const {todo, priority, status, category, dueDate} = request.body
  // Date valid / invalid
  const dateMatch = isMatch(dueDate, 'yyyy-MM-dd')
  let sqlQuery = null
  switch (true) {
    // Update Todo Status
    case status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        sqlQuery = `
          update
            todo
          set 
            status = '${status}'
          where
            id = ${todoId}
        ;`
        await db.run(sqlQuery)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    // Update Todo Priority
    case priority !== undefined:
      if (priority === 'MEDIUM' || priority === 'HIGH' || priority === 'LOW') {
        sqlQuery = `
          update
            todo
          set 
            priority = '${priority}'
          where
            id = ${todoId}
        ;`
        await db.run(sqlQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    // Update Todo Text
    case todo !== undefined:
      sqlQuery = `
        update
          todo
        set 
          todo = '${todo}'
        where
          id = ${todoId}
      ;`
      await db.run(sqlQuery)
      response.send('Todo Updated')
      break
    // Update Todo Category
    case category !== undefined:
      if (
        category === 'HOME' ||
        category === 'WORK' ||
        category === 'LEARNING'
      ) {
        sqlQuery = `
          update
            todo
          set 
            category = '${category}'
          where
            id = ${todoId}
        ;`
        await db.run(sqlQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    // Update Todo Due Date
    case dueDate !== undefined:
      if (dateMatch) {
        // Date formationg '2021-1-10' to '2021-01-10'
        const formatDate = format(new Date(dueDate), 'yyyy-MM-dd')
        sqlQuery = `
          update
            todo
          set 
            due_date = '${formatDate}'
          where
            id = ${todoId}
        ;`
        await db.run(sqlQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})

// 6.Delete Todo API
app.delete(`/todos/:todoId/`, async (request, response) => {
  const {todoId} = request.params
  const sqlQuery = `
    delete from
      todo
    where
      id = ${todoId}
  ;`
  await db.get(sqlQuery)
  response.send('Todo Deleted')
})

// Export Express instance
module.exports = app