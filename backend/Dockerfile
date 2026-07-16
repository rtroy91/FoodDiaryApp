FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY FoodDiary.sln ./
COPY FoodDiary.Api/FoodDiary.Api.csproj FoodDiary.Api/
RUN dotnet restore FoodDiary.sln

COPY . .
RUN dotnet publish FoodDiary.Api/FoodDiary.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false
CMD ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet FoodDiary.Api.dll
