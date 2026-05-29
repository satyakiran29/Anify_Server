# Android App Integration Spec for Anify Wallpaper Server

This document outlines the developer specification for integrating the **Anify Wallpaper REST API** into the **Anify Android App**. It details the endpoints, data models, Kotlin response wrappers, Retrofit service interfaces, and playback guidelines.

---

## 1. Environment & API Metadata
- **Base URL**: `https://anify-server-ma6d.onrender.com/api/v1/`
- **Static Assets Host**: `https://anify-server-ma6d.onrender.com`
- **Supported Formats**: JSON responses (HTTPS)
- **Local assets directory relative path prefix**: `/uploads/`

---

## 2. API Response Wrappers (Kotlin)

Because the REST API returns standard envelopes containing metadata and pagination details, we use generic wrapper objects rather than raw JSON arrays.

### A. Pagination Class
```kotlin
package com.skdev.anfiy.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class PaginationInfo(
    @SerializedName("total") val total: Int,
    @SerializedName("page") val page: Int,
    @SerializedName("limit") val limit: Int,
    @SerializedName("pages") val pages: Int
) : Parcelable
```

### B. Wallpapers Response Wrapper
```kotlin
package com.skdev.anfiy.models

import com.google.gson.annotations.SerializedName

data class WallpaperResponse(
    @SerializedName("status") val status: String,
    @SerializedName("results") val results: Int,
    @SerializedName("pagination") val pagination: PaginationInfo,
    @SerializedName("data") val data: WallpaperDataList
)

data class WallpaperDataList(
    @SerializedName("wallpapers") val wallpapers: List<Wallpaper>
)
```

### C. Live Wallpapers Response Wrapper
```kotlin
package com.skdev.anfiy.models

import com.google.gson.annotations.SerializedName

data class LivewallResponse(
    @SerializedName("status") val status: String,
    @SerializedName("results") val results: Int,
    @SerializedName("pagination") val pagination: PaginationInfo,
    @SerializedName("data") val data: LivewallDataList
)

data class LivewallDataList(
    @SerializedName("livewalls") val livewalls: List<Wallpaper>
)
```

### D. Ringtones Response Wrapper
```kotlin
package com.skdev.anfiy.models

import com.google.gson.annotations.SerializedName

data class RingtoneResponse(
    @SerializedName("status") val status: String,
    @SerializedName("results") val results: Int,
    @SerializedName("pagination") val pagination: PaginationInfo,
    @SerializedName("data") val data: RingtoneDataList
)

data class RingtoneDataList(
    @SerializedName("ringtones") val ringtones: List<Ringtone>
)
```

---

## 3. Retrofit API Service Interface (`WallpaperApiService.kt`)

Modify your `WallpaperApiService` interface to fetch paginated collections from the API:

```kotlin
package com.skdev.anfiy.network

import com.skdev.anfiy.models.WallpaperResponse
import com.skdev.anfiy.models.LivewallResponse
import com.skdev.anfiy.models.RingtoneResponse
import retrofit2.http.GET
import retrofit2.http.Query

interface WallpaperApiService {

    // 1. Get Static Wallpapers (Paginated & Filterable)
    @GET("wallpapers")
    suspend fun getWallpapers(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12,
        @Query("search") search: String? = null,
        @Query("category") category: String? = null,
        @Query("sort") sort: String? = null // "name" or "category"
    ): WallpaperResponse

    // 2. Get Live Wallpapers (Paginated & Filterable)
    @GET("livewalls")
    suspend fun getLiveWallpapers(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12,
        @Query("search") search: String? = null,
        @Query("category") category: String? = null,
        @Query("sort") sort: String? = null // "name" or "category"
    ): LivewallResponse

    // 3. Get Ringtones (Paginated & Filterable)
    @GET("ringtones")
    suspend fun getRingtones(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12,
        @Query("search") search: String? = null,
        @Query("sort") sort: String? = null // "name" or "author"
    ): RingtoneResponse
}
```

---

## 4. Retrofit API Client (`WallpaperApiClient.kt`)

Configure the Retrofit instance with the new API production URL:

```kotlin
package com.skdev.anfiy.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object WallpaperApiClient {
    private const val BASE_URL = "https://anify-server-ma6d.onrender.com/api/v1/"

    val service: WallpaperApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(WallpaperApiService::class.java)
    }
}
```

---

## 5. Integration Best Practices & Playback Guidelines

> [!IMPORTANT]
> **1. Resolving Local File Asset URLs**
> Uploaded wallpaper images, live video files, and ringtone audio tracks will return paths starting with `/uploads/...` (e.g., `/uploads/ringtone-12345.mp3`).
> You **MUST** check and prefix these URLs with the static assets host:
> `https://anify-server-ma6d.onrender.com`
> *Example Helper Function:*
> ```kotlin
> fun resolveAssetUrl(url: String): String {
>     return if (url.startsWith("/uploads/")) {
>         "https://anify-server-ma6d.onrender.com$url"
>     } else {
>         url
>     }
> }
> ```

> [!TIP]
> **2. Live Wallpaper Preview Playback**
> Live Wallpapers contain high-definition video assets. In the UI preview, load the video using ExoPlayer or standard Android `VideoView` components, setting them to **loop** and **mute** to resemble an interactive wallpaper backdrop.

> [!NOTE]
> **3. Ringtone Audio Preview Playback**
> Store a single reference to `MediaPlayer` inside your fragment/viewModel to play ringtones. Ensure that clicking a new audio track stops, resets, and releases the previous playback session to avoid overlapping audio outputs.
