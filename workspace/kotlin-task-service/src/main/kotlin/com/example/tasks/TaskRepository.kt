package com.example.tasks

import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

/**
 * Thread-safe in-memory repository. Swap this for a DB-backed implementation
 * behind the same interface without touching the routing layer.
 */
interface TaskRepository {
    fun all(): List<Task>
    fun find(id: Long): Task?
    fun create(title: String, description: String): Task
    fun update(id: Long, patch: UpdateTaskRequest): Task?
    fun delete(id: Long): Boolean
}

class InMemoryTaskRepository : TaskRepository {
    private val store = ConcurrentHashMap<Long, Task>()
    private val seq = AtomicLong(0)

    override fun all(): List<Task> = store.values.sortedBy { it.id }

    override fun find(id: Long): Task? = store[id]

    override fun create(title: String, description: String): Task {
        val id = seq.incrementAndGet()
        val task = Task(id = id, title = title, description = description, status = TaskStatus.TODO)
        store[id] = task
        return task
    }

    override fun update(id: Long, patch: UpdateTaskRequest): Task? {
        return store.computeIfPresent(id) { _, existing ->
            existing.copy(
                title = patch.title ?: existing.title,
                description = patch.description ?: existing.description,
                status = patch.status ?: existing.status
            )
        }
    }

    override fun delete(id: Long): Boolean = store.remove(id) != null
}
