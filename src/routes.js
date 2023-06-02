import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import { DataAtual } from "./utils/current-date-br.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (title && description) {
        const task = {
          id: randomUUID(),
          title,
          description,
          complete_at: null,
          create_at: DataAtual(),
          update_at: null,
        };

        database.insert("tasks", task);

        return res.writeHead(201).end();
      } else {
        res.writeHead(500).end("title e description são obrigatórios");
      }
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (title && description) {
          const existingData = database.select("tasks", { id });
    
          if (!existingData || existingData.length === 0) {
            return res.writeHead(404).end();
          }
    
          const existingTask = existingData[0];
    
          database.update("tasks", id, {
            title: title || existingTask.title,
            description: description || existingTask.description,
            complete_at: existingTask.complete_at,
            create_at: existingTask.create_at,
            update_at: DataAtual(),
          });
    
          return res.writeHead(204).end();
      } else {
        return res.writeHead(500).end('Missing data')
      }

    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const existingData = database.select("tasks", { id });

      if (!existingData || existingData.length === 0) {
        return res.writeHead(404).end();
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const existingData = database.select("tasks", { id });

      if (!existingData || existingData.length === 0) {
        return res.writeHead(404).end();
      }

      const existingTask = existingData[0];

      database.update("tasks", id, {
        title: existingTask.title,
        description: existingTask.description,
        complete_at: DataAtual(),
        create_at: existingTask.create_at,
        update_at: existingTask.create_at,
      });

      return res.writeHead(204).end();
    },
  },
];
