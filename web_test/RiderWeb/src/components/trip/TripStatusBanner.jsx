import { Star, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TripStatusBanner({
    trip,
    navigate,
    ratingDriver,
    setRatingDriver,
    ratingTrip,
    setRatingTrip,
    comment,
    setComment,
    handleRateTrip,
    isRatingSubmitting
}) {
    // 1. Cancelled Trip
    if (trip.status === 'CANCELLED') {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-6 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-bold text-lg">Trip Cancelled</span>
                </div>
                <p className="text-sm">This trip was cancelled.</p>
                <Button className="mt-4 bg-white text-red-600 border border-red-200 hover:bg-red-50" size="sm" onClick={() => navigate('/map')}>
                    Book Another Ride
                </Button>
            </div>
        );
    }

    // 2. Active Trip (Not completed yet) - Currently shows nothing special in this banner area based on original code logic
    // The original code only showed the rating UI if trip was completed (implied, or if we want to add a check for status === 'COMPLETED')
    // However, the original code specifically checked !trip.ratingDriver etc. which implies it shows this UI when unrated or rated.
    // Let's assume this banner is for "Post-Trip Action" or "Trip Status".

    // If not completed or cancelled, we might not want to show anything here, or maybe the trip details handles it.
    // But based on the placement in the original file, this block handles the rating interaction.
    if (trip.status !== 'COMPLETED') return null;

    // 3. Unrated Trip (Show Rating Form)
    if (!trip.ratingDriver && !trip.ratingTrip) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm w-full max-w-sm">
                {/* DRIVER RATING */}
                <h4 className="font-bold text-center mb-2 text-slate-800">Rate your Driver</h4>
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={`d-${star}`}
                            className={`w-8 h-8 cursor-pointer transition-colors ${star <= ratingDriver ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`}
                            onClick={() => setRatingDriver(star)}
                        />
                    ))}
                </div>

                {/* TRIP RATING */}
                <h4 className="font-bold text-center mb-2 text-slate-800 border-t pt-4">Rate the Trip</h4>
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={`t-${star}`}
                            className={`w-8 h-8 cursor-pointer transition-colors ${star <= ratingTrip ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`}
                            onClick={() => setRatingTrip(star)}
                        />
                    ))}
                </div>

                <textarea
                    className="w-full p-2 border rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Leave a comment (optional)..."
                    rows="2"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleRateTrip}
                    disabled={isRatingSubmitting}
                >
                    {isRatingSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Submit Rating"}
                </Button>
            </div>
        );
    }

    // 4. Already Rated Trip
    return (
        <div className="text-center w-full max-w-sm bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Driver</p>
                    <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < trip.ratingDriver ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Trip</p>
                    <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < trip.ratingTrip ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-sm italic text-slate-600 bg-slate-50 p-2 rounded">" {trip.ratingComment || "No comment"} "</p>
            <div className="mt-2 text-xs font-semibold text-green-800">Thanks for your feedback!</div>
            <Button variant="ghost" className="mt-4 text-green-700 hover:bg-green-200" size="sm" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
            </Button>
        </div>
    );
}
