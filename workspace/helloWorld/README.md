# helloWorld

A minimal Java 21 Maven application.

- **Base package:** `com.interview.preps`
- **Entry point:** `com.interview.preps.Main`
- **Build tool:** Maven
- **Java version:** 21

## Build & Test

```bash
mvn clean package
```

This compiles the code, runs the JUnit 5 tests, and produces `target/helloWorld.jar`.

## Run

Via the packaged jar:

```bash
java -jar target/helloWorld.jar
```

Via Maven (using the compiled classes):

```bash
mvn -q compile exec:java -Dexec.mainClass=com.interview.preps.Main
```

## IntelliJ IDEA

On import, a shareable run configuration named **helloWorld** (in `.run/helloWorld.run.xml`)
is available immediately — just select it and click Run.
