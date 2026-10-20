import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from '@exp1/components/Header.jsx'
import Footer from '@exp1/components/Footer.jsx'
import ProtectedRoute from '@exp4/components/ProtectedRoute.jsx'
import Loading from '@exp4/components/Loading.jsx'
import { BookingProvider } from '@exp2/context/BookingContext.jsx'

// route pages lazy-ah load aagum, so ovvoru page-kum thani JS chunk
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const HotelSearchPage = lazy(() => import('./pages/HotelSearchPage.jsx'))
const HotelDetailPage = lazy(() => import('./pages/HotelDetailPage.jsx'))
const RoomSelectionPage = lazy(() => import('./pages/RoomSelectionPage.jsx'))
const GuestDetailsPage = lazy(() => import('./pages/GuestDetailsPage.jsx'))
const BookingSummaryPage = lazy(() => import('./pages/BookingSummaryPage.jsx'))
const PaymentPage = lazy(() => import('./pages/PaymentPage.jsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'))
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage.jsx'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage.jsx'))
const LoginPage = lazy(() => import('@exp4/pages/LoginPage.jsx'))
const SignUpPage = lazy(() => import('@exp4/pages/SignUpPage.jsx'))

export default function App() {
  return (
    <BookingProvider>
      <div className="min-h-screen flex flex-col bg-sand text-harbor-900">
        {/* (e) keyboard: Tab press panna first-la idhu theriyum */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-harbor-800 focus:px-3 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <Suspense fallback={<Loading text="Loading page…" />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/stays" element={<HotelSearchPage />} />
                <Route path="/hotel/:id" element={<HotelDetailPage />} />
                <Route path="/hotel/:id/rooms" element={<RoomSelectionPage />} />
                <Route path="/hotel/:id/guest" element={<GuestDetailsPage />} />
                <Route path="/hotel/:id/summary" element={<BookingSummaryPage />} />
                <Route path="/hotel/:id/payment" element={<PaymentPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/confirmation" element={<ConfirmationPage />} />
                <Route path="/bookings" element={<MyBookingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BookingProvider>
  )
}