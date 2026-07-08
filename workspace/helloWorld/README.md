# HelloWorld

A minimal Java 21 application built with Maven.

- **Base package:** `com.interview.palo`
- **Entry point:** `com.interview.palo.Main`
- **Java version:** 21

> Note: requested target location was `c:\Interviews\preps\HelloWorld`, but the
> build agent is sandboxed to its workspace. Copy this `HelloWorld` folder there
> to use the intended path.

## Build & Test

```bash
mvn clean test      # compile and run JUnit 5 tests
mvn clean package   # build the jar
```

## Run

Using the exec plugin:

```bash
mvn compile exec:java
```

Or run the compiled class directly:

```bash
java -cp target/classes com.interview.palo.Main
```

## IntelliJ

The project ships with a shared run configuration at `.run/HelloWorld.run.xml`.
On import, IntelliJ picks it up automatically — just select **HelloWorld** and run.
