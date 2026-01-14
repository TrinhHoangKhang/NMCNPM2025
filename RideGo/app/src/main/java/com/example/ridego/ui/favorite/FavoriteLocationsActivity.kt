package com.example.ridego.ui.favorite

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ridego.R
import com.example.ridego.ui.rider.location.SetLocationActivity
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions

data class FavoriteLocation(
    val name: String = "",
    val address: String = "",
    val lat: Double = 0.0,
    val lng: Double = 0.0,
    val icon: String = "📍",
    val type: Int = 0 // 0: Custom, 3: Home, 4: Work
)

class FavoriteLocationsActivity : AppCompatActivity() {

    private lateinit var rvFavoriteLocations: RecyclerView
    private lateinit var adapter: FavoriteLocationAdapter
    private val locationsList = mutableListOf<FavoriteLocation>()
    private val db = FirebaseFirestore.getInstance()
    private val currentUser = FirebaseAuth.getInstance().currentUser
    
    private var pendingLocationName: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_favorite_locations)

        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        toolbar.setNavigationOnClickListener { onBackPressed() }

        rvFavoriteLocations = findViewById(R.id.rvFavoriteLocations)
        val fabAddLocation = findViewById<FloatingActionButton>(R.id.fabAddLocation)

        rvFavoriteLocations.layoutManager = LinearLayoutManager(this)
        adapter = FavoriteLocationAdapter(locationsList) { location, action ->
            if (action == "EDIT") {
                handleEditLocation(location)
            } else if (action == "DELETE") {
                handleDeleteLocation(location)
            }
        }
        rvFavoriteLocations.adapter = adapter

        fabAddLocation.setOnClickListener {
            // Show dialog to enter name first, or open map?
            // Let's open Map first, then ask for Name (Plan said Map then Name, but logical flow: Name -> Map or Map -> Name. Plan detailed: Map -> Name)
            val intent = Intent(this, SetLocationActivity::class.java)
            intent.putExtra("IS_BOOKING_FLOW", false) // Return result mode
            intent.putExtra("LOCATION_TYPE", 5) // Generic
            startActivityForResult(intent, 100)
        }
        
        loadData()
    }
    
    private fun loadData() {
        if (currentUser == null) return
        
        val uid = currentUser.uid
        db.collection("uid_mapping").document(uid).get().addOnSuccessListener { mapping ->
            val targetId = mapping.getString("customUserId") ?: uid
            db.collection("users").document(targetId).get().addOnSuccessListener { doc ->
                locationsList.clear()
                
                // 1. Home
                val homeAddress = doc.getString("homeAddress")
                if (!homeAddress.isNullOrEmpty()) {
                    val lat = doc.getDouble("homeLat") ?: 0.0
                    val lng = doc.getDouble("homeLng") ?: 0.0
                    locationsList.add(FavoriteLocation("Nhà riêng", homeAddress, lat, lng, "🏠", 3))
                } else {
                     locationsList.add(FavoriteLocation("Nhà riêng", "Chạm để thiết lập", 0.0, 0.0, "🏠", 3))
                }
                
                // 2. Work
                val workAddress = doc.getString("workAddress")
                if (!workAddress.isNullOrEmpty()) {
                    val lat = doc.getDouble("workLat") ?: 0.0
                    val lng = doc.getDouble("workLng") ?: 0.0
                    locationsList.add(FavoriteLocation("Văn phòng", workAddress, lat, lng, "🏢", 4))
                } else {
                     locationsList.add(FavoriteLocation("Văn phòng", "Chạm để thiết lập", 0.0, 0.0, "🏢", 4))
                }
                
                // 3. Saved Places
                val savedPlaces = doc.get("savedPlaces") as? List<Map<String, Any>>
                if (savedPlaces != null) {
                    for (place in savedPlaces) {
                        val name = place["name"] as? String ?: ""
                        val address = place["address"] as? String ?: ""
                        val lat = place["lat"] as? Double ?: 0.0
                        val lng = place["lng"] as? Double ?: 0.0
                        val icon = place["icon"] as? String ?: "📍"
                        locationsList.add(FavoriteLocation(name, address, lat, lng, icon, 0))
                    }
                }
                
                adapter.notifyDataSetChanged()
            }
        }
    }

    private fun handleEditLocation(location: FavoriteLocation) {
        if (location.type == 3 || location.type == 4) {
            // Edit Home/Work -> Open SetLocationActivity directly
            val intent = Intent(this, SetLocationActivity::class.java)
            intent.putExtra("LOCATION_TYPE", location.type)
            startActivity(intent) 
            // Note: SetLocationActivity for type 3/4 auto-saves to Firebase, so we just reload onResume
        } else {
            // Edit Custom Location -> Rename or Delete? 
            // For now, let's just offer to Delete or Rename. 
            // Complex edit (move map) is harder to reuse existing SetLocation logic without passing lots of data.
            // Let's show a dialog actions
            val options = arrayOf("Đổi tên", "Xóa")
            AlertDialog.Builder(this)
                .setTitle(location.name)
                .setItems(options) { _, which ->
                    if (which == 0) {
                        showRenameDialog(location)
                    } else {
                        handleDeleteLocation(location)
                    }
                }
                .show()
        }
    }
    
    private fun showRenameDialog(location: FavoriteLocation) {
        val input = EditText(this)
        input.setText(location.name)
        AlertDialog.Builder(this)
            .setTitle("Đổi tên địa điểm")
            .setView(input)
            .setPositiveButton("Lưu") { _, _ ->
                val newName = input.text.toString()
                if (newName.isNotEmpty()) {
                    updateCustomLocation(location, newName)
                }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }
    
    private fun updateCustomLocation(oldLoc: FavoriteLocation, newName: String) {
        // Remove old, add new (modified)
        if (currentUser == null) return
        val uid = currentUser.uid
        
        db.collection("uid_mapping").document(uid).get().addOnSuccessListener { mapping ->
             val targetId = mapping.getString("customUserId") ?: uid
             val userRef = db.collection("users").document(targetId)
             
             // Firebase Firestore removal requires exact object match, which is tricky with floating points.
             // Easier to fetch all, modify in list, save back.
             userRef.get().addOnSuccessListener { doc ->
                 val currentList = doc.get("savedPlaces") as? ArrayList<Map<String, Any>> ?: arrayListOf()
                 val updatedList = arrayListOf<Map<String, Any>>()
                 
                 for (item in currentList) {
                     val addr = item["address"] as? String
                     val name = item["name"] as? String
                     if (addr == oldLoc.address && name == oldLoc.name) {
                         // This is the one to modify
                         val newItem = item.toMutableMap()
                         newItem["name"] = newName
                         updatedList.add(newItem)
                     } else {
                         updatedList.add(item)
                     }
                 }
                 
                 userRef.update("savedPlaces", updatedList).addOnSuccessListener {
                     loadData()
                     Toast.makeText(this, "Đã cập nhật", Toast.LENGTH_SHORT).show()
                 }
             }
        }
    }

    private fun handleDeleteLocation(location: FavoriteLocation) {
        if (location.type == 3 || location.type == 4) {
             Toast.makeText(this, "Không thể xóa Nhà riêng/Văn phòng. Hãy chọn 'Thiết lập' để thay đổi.", Toast.LENGTH_LONG).show()
             return
        }
        
        AlertDialog.Builder(this)
            .setTitle("Xóa địa điểm?")
            .setMessage("Bạn có chắc muốn xóa '${location.name}'?")
            .setPositiveButton("Xóa") { _, _ ->
                 deleteCustomLocation(location)
            }
            .setNegativeButton("Hủy", null)
            .show()
    }
    
    private fun deleteCustomLocation(location: FavoriteLocation) {
        if (currentUser == null) return
        val uid = currentUser.uid
        
        db.collection("uid_mapping").document(uid).get().addOnSuccessListener { mapping ->
             val targetId = mapping.getString("customUserId") ?: uid
             val userRef = db.collection("users").document(targetId)
             
             userRef.get().addOnSuccessListener { doc ->
                 val currentList = doc.get("savedPlaces") as? ArrayList<Map<String, Any>> ?: arrayListOf()
                 val updatedList = arrayListOf<Map<String, Any>>()
                 
                 for (item in currentList) {
                     val addr = item["address"] as? String
                     val name = item["name"] as? String
                     // Match by address and name roughly
                     if (addr != location.address || name != location.name) {
                         updatedList.add(item)
                     }
                 }
                 
                 userRef.update("savedPlaces", updatedList).addOnSuccessListener {
                     loadData()
                     Toast.makeText(this, "Đã xóa", Toast.LENGTH_SHORT).show()
                 }
             }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 100 && resultCode == Activity.RESULT_OK && data != null) {
            val address = data.getStringExtra("SELECTED_ADDRESS") ?: ""
            val lat = data.getDoubleExtra("SELECTED_LAT", 0.0)
            val lng = data.getDoubleExtra("SELECTED_LNG", 0.0)
            
            showNameInputDialog(address, lat, lng)
        }
    }
    
    private fun showNameInputDialog(address: String, lat: Double, lng: Double) {
        val input = EditText(this)
        input.hint = "Ví dụ: Trường học, Gym..."
        
        AlertDialog.Builder(this)
            .setTitle("Đặt tên cho địa điểm")
            .setMessage(address)
            .setView(input)
            .setPositiveButton("Lưu") { _, _ ->
                val name = input.text.toString()
                if (name.isNotEmpty()) {
                    saveNewLocation(name, address, lat, lng)
                } else {
                    Toast.makeText(this, "Vui lòng nhập tên", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }
    
    private fun saveNewLocation(name: String, address: String, lat: Double, lng: Double) {
        if (currentUser == null) return
        val uid = currentUser.uid
        
        val newPlace = mapOf(
            "name" to name,
            "address" to address,
            "lat" to lat,
            "lng" to lng,
            "icon" to "📍" 
        )
        
        db.collection("uid_mapping").document(uid).get().addOnSuccessListener { mapping ->
             val targetId = mapping.getString("customUserId") ?: uid
             val userRef = db.collection("users").document(targetId)
             
             // Use arrayUnion to append
             userRef.update("savedPlaces", com.google.firebase.firestore.FieldValue.arrayUnion(newPlace))
                 .addOnSuccessListener {
                     loadData()
                     Toast.makeText(this, "Đã lưu địa điểm mới", Toast.LENGTH_SHORT).show()
                 }
                 .addOnFailureListener {
                     // If field doesn't exist, Create it
                     userRef.set(mapOf("savedPlaces" to listOf(newPlace)), SetOptions.merge())
                         .addOnSuccessListener {
                             loadData()
                             Toast.makeText(this, "Đã lưu địa điểm mới", Toast.LENGTH_SHORT).show()
                         }
                 }
        }
    }
    
    override fun onResume() {
        super.onResume()
        loadData()
    }
}

class FavoriteLocationAdapter(
    private val locations: List<FavoriteLocation>,
    private val onAction: (FavoriteLocation, String) -> Unit
) : RecyclerView.Adapter<FavoriteLocationAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvName: TextView = view.findViewById(R.id.tvName)
        val tvAddress: TextView = view.findViewById(R.id.tvAddress)
        val tvIcon: TextView = view.findViewById(R.id.tvIcon)
        val btnEdit: ImageView = view.findViewById(R.id.btnEdit)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_favorite_location, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val location = locations[position]
        holder.tvName.text = location.name
        holder.tvAddress.text = location.address
        holder.tvIcon.text = location.icon
        
        holder.btnEdit.setOnClickListener {
            onAction(location, "EDIT")
        }
        
        holder.itemView.setOnClickListener {
             if (location.address == "Chạm để thiết lập") {
                 onAction(location, "EDIT") // Treat as setup
             }
        }
    }

    override fun getItemCount() = locations.size
}
