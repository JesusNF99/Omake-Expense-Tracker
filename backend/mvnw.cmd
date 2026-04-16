@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM ----------------------------------------------------------------------------

@IF "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%
@IF "%MAVEN_BATCH_PAUSE%" == "on" echo %MAVEN_BATCH_PAUSE%

@REM Set local scope for the variables with windows NT shell
@SETLOCAL EnableDelayedExpansion

@REM ===========================================================================
@REM Validate Java
@REM ===========================================================================

IF NOT "%JAVA_HOME%" == "" GOTO findJavaFromJavaHome

SET JAVA_CMD=java.exe
%JAVA_CMD% -version >NUL 2>&1
IF NOT ERRORLEVEL 1 GOTO init

echo.
echo ERROR: JAVA_HOME is not set and 'java' was not found on the PATH. 1>&2
echo Please install Java 21+ and set JAVA_HOME. 1>&2
echo.
GOTO error

:findJavaFromJavaHome
SET JAVA_HOME=%JAVA_HOME:"=%
SET JAVA_CMD=%JAVA_HOME%/bin/java.exe

IF EXIST "%JAVA_CMD%" GOTO init

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME% 1>&2
echo Please set JAVA_HOME to the location of your JDK installation. 1>&2
echo.
GOTO error

:init
@REM ===========================================================================
@REM Find the project base directory
@REM ===========================================================================

SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
IF NOT "%MAVEN_PROJECTBASEDIR%" == "" GOTO endDetectBaseDir

SET EXEC_DIR=%CD%
:findBaseDir
IF EXIST "%EXEC_DIR%\pom.xml" SET MAVEN_PROJECTBASEDIR=%EXEC_DIR%
IF "%EXEC_DIR%" == "%EXEC_DIR:~0,3%" GOTO baseDirDetectedByDefault
SET UP_DIR=%EXEC_DIR%\..
IF NOT "%MAVEN_PROJECTBASEDIR%" == "" GOTO endDetectBaseDir
CD /D "%UP_DIR%"
SET EXEC_DIR=%CD%
GOTO findBaseDir

:baseDirDetectedByDefault
IF "%MAVEN_PROJECTBASEDIR%" == "" (
  SET MAVEN_PROJECTBASEDIR=%cd%
)

:endDetectBaseDir
IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties" GOTO error

@REM ===========================================================================
@REM Read wrapper properties
@REM ===========================================================================

SET WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties
SET WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar

FOR /F "usebackq tokens=1,2 delims==" %%G IN ("%WRAPPER_PROPERTIES%") DO (
  IF "%%G"=="distributionUrl" SET DISTRIBUTION_URL=%%H
  IF "%%G"=="wrapperUrl" SET WRAPPER_URL=%%H
)

@REM ===========================================================================
@REM Download wrapper JAR if not present
@REM ===========================================================================

IF EXIST "%WRAPPER_JAR%" GOTO runMavenWrapper

echo Downloading Maven Wrapper from: %WRAPPER_URL%
powershell -Command "Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'" ^
  || (echo ERROR: Failed to download maven-wrapper.jar & GOTO error)

:runMavenWrapper

@REM ===========================================================================
@REM Set user home and Maven home path
@REM ===========================================================================

IF NOT "%MAVEN_USER_HOME%" == "" GOTO skipUserHome
SET MAVEN_USER_HOME=%USERPROFILE%\.m2
:skipUserHome

@REM Parse version from distribution URL
FOR %%F IN ("%DISTRIBUTION_URL%") DO SET DIST_FILENAME=%%~nxF
SET DIST_VERSION=%DIST_FILENAME:apache-maven-=%
SET DIST_VERSION=%DIST_VERSION:-bin.zip=%

SET MAVEN_HOME=%MAVEN_USER_HOME%\wrapper\dists\apache-maven-%DIST_VERSION%-bin\apache-maven-%DIST_VERSION%

@REM ===========================================================================
@REM Launch the wrapper
@REM ===========================================================================

SET CLASSPATH=%WRAPPER_JAR%
SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

"%JAVA_CMD%" ^
  %JAVA_OPTS% ^
  %MAVEN_OPTS% ^
  -classpath "%CLASSPATH%" ^
  "-Dmaven.home=%MAVEN_HOME%" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  %WRAPPER_LAUNCHER% %*

IF ERRORLEVEL 1 GOTO error
GOTO end

:error
SET ERROR_CODE=1

:end
@ENDLOCAL
EXIT /B %ERROR_CODE%
