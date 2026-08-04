package com.example.tasks

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.registerTaskRoutes(repo: TaskRepository) {
    routing {
        get("/health") {
            call.respond(mapOf("status" to "UP"))
        }

        route("/tasks") {
            get {
                call.respond(repo.all())
            }

            get("/{id}") {
                val id = call.pathId()
                val task = repo.find(id) ?: return@get call.respond(
                    HttpStatusCode.NotFound, ErrorResponse("Task $id not found")
                )
                call.respond(task)
            }

            post {
                val body = call.receive<CreateTaskRequest>()
                if (body.title.isBlank()) throw ValidationException("title must not be blank")
                val created = repo.create(body.title.trim(), body.description.trim())
                call.respond(HttpStatusCode.Created, created)
            }

            put("/{id}") {
                val id = call.pathId()
                val body = call.receive<UpdateTaskRequest>()
                if (body.title != null && body.title.isBlank()) {
                    throw ValidationException("title must not be blank")
                }
                val updated = repo.update(id, body) ?: return@put call.respond(
                    HttpStatusCode.NotFound, ErrorResponse("Task $id not found")
                )
                call.respond(updated)
            }

            delete("/{id}") {
                val id = call.pathId()
                if (repo.delete(id)) {
                    call.respond(HttpStatusCode.NoContent)
                } else {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Task $id not found"))
                }
            }
        }
    }
}

private fun ApplicationCall.pathId(): Long =
    parameters["id"]?.toLongOrNull() ?: throw ValidationException("id must be a number")
