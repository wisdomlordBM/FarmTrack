# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY FarmTrack.API/FarmTrack.API.csproj FarmTrack.API/
COPY FarmTrack.Core/FarmTrack.Core.csproj FarmTrack.Core/
COPY FarmTrack.Infrastructure/FarmTrack.Infrastructure.csproj FarmTrack.Infrastructure/

# Restore dependencies
RUN dotnet restore FarmTrack.API/FarmTrack.API.csproj

# Copy all source code
COPY . .

# Build and publish
RUN dotnet publish FarmTrack.API/FarmTrack.API.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "FarmTrack.API.dll"]