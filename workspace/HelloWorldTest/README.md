# HelloWorldTest

A minimal Java 21 application built with Maven.

- **Base package:** `com.hw`
- **Entry point:** `com.hw.Main`
- **Java version:** 21
- **Build tool:** Maven

## Build & Test

```bash
mvn clean test
```

## Run

Via the exec plugin:

```bash
mvn compile exec:java
```

Or run the packaged jar:

```bash
mvn clean package
java -cp target/HelloWorldTest.jar com.hw.Main
```

## IntelliJ IDEA

A shareable run configuration is provided at `.run/HelloWorldTest.run.xml`.
Open the project in IntelliJ (import as a Maven project) and the
**HelloWorldTest** Application run configuration will be available immediately —
just press Run.
