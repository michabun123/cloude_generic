package com.example.tasks

import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TaskApiTest {

    @Test
    fun `health returns UP`() = testApplication {
        application { module() }
        val res = client.get("/health")
        assertEquals(HttpStatusCode.OK, res.status)
        assertTrue(res.bodyAsText().contains("UP"))
    }

    @Test
    fun `create then fetch task`() = testApplication {
        application { module() }
        val client = createClient { install(ContentNegotiation) { json() } }

        val created: Task = client.post("/tasks") {
            contentType(ContentType.Application.Json)
            setBody(CreateTaskRequest(title = "Write tests", description = "cover the API"))
        }.body()

        assertEquals("Write tests", created.title)
        assertEquals(TaskStatus.TODO, created.status)

        val fetched: Task = client.get("/tasks/${created.id}").body()
        assertEquals(created.id, fetched.id)
    }

    @Test
    fun `update changes status`() = testApplication {
        application { module() }
        val client = createClient { install(ContentNegotiation) { json() } }

        val created: Task = client.post("/tasks") {
            contentType(ContentType.Application.Json)
            setBody(CreateTaskRequest(title = "Task"))
        }.body()

        val updated: Task = client.put("/tasks/${created.id}") {
            contentType(ContentType.Application.Json)
            setBody(UpdateTaskRequest(status = TaskStatus.DONE))
        }.body()

        assertEquals(TaskStatus.DONE, updated.status)
        assertEquals("Task", updated.title) // unchanged
    }

    @Test
    fun `delete removes task`() = testApplication {
        application { module() }
        val client = createClient { install(ContentNegotiation) { json() } }

        val created: Task = client.post("/tasks") {
            contentType(ContentType.Application.Json)
            setBody(CreateTaskRequest(title = "Temp"))
        }.body()

        val del = client.delete("/tasks/${created.id}")
        assertEquals(HttpStatusCode.NoContent, del.status)

        val getAfter = client.get("/tasks/${created.id}")
        assertEquals(HttpStatusCode.NotFound, getAfter.status)
    }

    @Test
    fun `blank title is rejected`() = testApplication {
        application { module() }
        val client = createClient { install(ContentNegotiation) { json() } }

        val res = client.post("/tasks") {
            contentType(ContentType.Application.Json)
            setBody(CreateTaskRequest(title = "   "))
        }
        assertEquals(HttpStatusCode.BadRequest, res.status)
    }

    @Test
    fun `unknown task returns 404`() = testApplication {
        application { module() }
        val res = client.get("/tasks/9999")
        assertEquals(HttpStatusCode.NotFound, res.status)
    }
}
