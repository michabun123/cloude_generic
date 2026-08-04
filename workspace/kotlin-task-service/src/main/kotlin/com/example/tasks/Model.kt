package com.example.tasks

import kotlinx.serialization.Serializable

enum class TaskStatus { TODO, IN_PROGRESS, DONE }

@Serializable
data class Task(
    val id: Long,
    val title: String,
    val description: String = "",
    val status: TaskStatus = TaskStatus.TODO
)

/** Payload for creating a task. */
@Serializable
data class CreateTaskRequest(
    val title: String,
    val description: String = ""
)

/** Payload for updating a task; any field may be omitted (null = leave unchanged). */
@Serializable
data class UpdateTaskRequest(
    val title: String? = null,
    val description: String? = null,
    val status: TaskStatus? = null
)

@Serializable
data class ErrorResponse(val error: String)

/** Thrown for client-side validation problems; mapped to HTTP 400. */
class ValidationException(message: String) : RuntimeException(message)
