#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Temple Admin Panel
Tests all authentication, CRUD operations, data validation, and edge cases
"""

import requests
import json
import sys
from datetime import datetime
import base64

# Configuration
BASE_URL = "https://703ff1fd-08fb-42ea-96df-dcb7de36b8a6.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class TempleAPITester:
    def __init__(self):
        self.token = None
        self.test_results = []
        self.session = requests.Session()
        
    def log_test(self, test_name, success, message="", details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if details and not success:
            print(f"   Details: {details}")
        print()

    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        try:
            response = self.session.post(
                f"{BASE_URL}/admin/login",
                json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and data["token"]:
                    self.token = data["token"]
                    self.log_test("Admin Login - Valid Credentials", True, 
                                f"Token received: {data['token'][:20]}...")
                    return True
                else:
                    self.log_test("Admin Login - Valid Credentials", False, 
                                "No token in response", data)
            else:
                self.log_test("Admin Login - Valid Credentials", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Login - Valid Credentials", False, 
                        f"Exception: {str(e)}")
        return False

    def test_admin_login_failure(self):
        """Test admin login with incorrect credentials"""
        try:
            response = self.session.post(
                f"{BASE_URL}/admin/login",
                json={"username": "wrong", "password": "wrong"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 401:
                self.log_test("Admin Login - Invalid Credentials", True, 
                            "Correctly rejected invalid credentials")
            else:
                self.log_test("Admin Login - Invalid Credentials", False, 
                            f"Expected 401, got {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Login - Invalid Credentials", False, 
                        f"Exception: {str(e)}")

    def test_token_validation(self):
        """Test token validation for protected endpoints"""
        try:
            # Test without token
            response = self.session.get(f"{BASE_URL}/kundali-users")
            if response.status_code == 403:
                self.log_test("Token Validation - No Token", True, 
                            "Correctly rejected request without token")
            else:
                self.log_test("Token Validation - No Token", False, 
                            f"Expected 403, got {response.status_code}")

            # Test with invalid token
            response = self.session.get(
                f"{BASE_URL}/kundali-users",
                headers={"Authorization": "Bearer invalid_token"}
            )
            if response.status_code == 403:
                self.log_test("Token Validation - Invalid Token", True, 
                            "Correctly rejected invalid token")
            else:
                self.log_test("Token Validation - Invalid Token", False, 
                            f"Expected 403, got {response.status_code}")

        except Exception as e:
            self.log_test("Token Validation", False, f"Exception: {str(e)}")

    def get_auth_headers(self):
        """Get authorization headers with token"""
        return {"Authorization": f"Bearer {self.token}"}

    def test_kundali_users_api(self):
        """Test Kundali Users CRUD operations"""
        headers = self.get_auth_headers()
        
        # Test GET all users
        try:
            response = self.session.get(f"{BASE_URL}/kundali-users", headers=headers)
            if response.status_code == 200:
                users = response.json()
                self.log_test("Kundali Users - GET All", True, 
                            f"Retrieved {len(users)} users")
            else:
                self.log_test("Kundali Users - GET All", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Kundali Users - GET All", False, f"Exception: {str(e)}")

        # Test POST create user
        test_user = {
            "name": "Rajesh Kumar",
            "birth_date": "1985-03-15",
            "birth_time": "14:30",
            "birth_place": "Mumbai, Maharashtra",
            "phone": "+91-9876543210",
            "email": "rajesh.kumar@email.com",
            "horoscope_data": "Detailed horoscope analysis for Rajesh Kumar",
            "consultation_history": ["Initial consultation on 2024-01-15"]
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/kundali-users", 
                json=test_user, 
                headers=headers
            )
            if response.status_code == 200:
                created_user = response.json()
                user_id = created_user.get("id")
                self.log_test("Kundali Users - POST Create", True, 
                            f"Created user with ID: {user_id}")
                
                # Test GET by ID
                if user_id:
                    response = self.session.get(
                        f"{BASE_URL}/kundali-users/{user_id}", 
                        headers=headers
                    )
                    if response.status_code == 200:
                        self.log_test("Kundali Users - GET by ID", True, 
                                    "Successfully retrieved user by ID")
                    else:
                        self.log_test("Kundali Users - GET by ID", False, 
                                    f"HTTP {response.status_code}")
            else:
                self.log_test("Kundali Users - POST Create", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Kundali Users - POST Create", False, f"Exception: {str(e)}")

        # Test invalid user creation (missing required fields)
        try:
            invalid_user = {"name": "Test"}  # Missing required fields
            response = self.session.post(
                f"{BASE_URL}/kundali-users", 
                json=invalid_user, 
                headers=headers
            )
            if response.status_code == 422:
                self.log_test("Kundali Users - Validation", True, 
                            "Correctly rejected invalid user data")
            else:
                self.log_test("Kundali Users - Validation", False, 
                            f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Kundali Users - Validation", False, f"Exception: {str(e)}")

    def test_events_api(self):
        """Test Events CRUD operations"""
        headers = self.get_auth_headers()
        
        # Test GET all events
        try:
            response = self.session.get(f"{BASE_URL}/events", headers=headers)
            if response.status_code == 200:
                events = response.json()
                self.log_test("Events - GET All", True, f"Retrieved {len(events)} events")
            else:
                self.log_test("Events - GET All", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Events - GET All", False, f"Exception: {str(e)}")

        # Test POST create event
        test_event = {
            "name": "Maha Shivaratri Celebration",
            "date": "2024-03-08",
            "time": "18:00",
            "description": "Grand celebration of Lord Shiva with special prayers and cultural programs",
            "category": "Religious Festival"
        }
        
        created_event_id = None
        try:
            response = self.session.post(f"{BASE_URL}/events", json=test_event, headers=headers)
            if response.status_code == 200:
                created_event = response.json()
                created_event_id = created_event.get("id")
                self.log_test("Events - POST Create", True, f"Created event with ID: {created_event_id}")
            else:
                self.log_test("Events - POST Create", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Events - POST Create", False, f"Exception: {str(e)}")

        # Test PUT update event
        if created_event_id:
            updated_event = {
                "name": "Maha Shivaratri Celebration - Updated",
                "date": "2024-03-08",
                "time": "19:00",
                "description": "Updated: Grand celebration with extended timings",
                "category": "Religious Festival"
            }
            try:
                response = self.session.put(
                    f"{BASE_URL}/events/{created_event_id}", 
                    json=updated_event, 
                    headers=headers
                )
                if response.status_code == 200:
                    self.log_test("Events - PUT Update", True, "Successfully updated event")
                else:
                    self.log_test("Events - PUT Update", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test("Events - PUT Update", False, f"Exception: {str(e)}")

            # Test DELETE event
            try:
                response = self.session.delete(f"{BASE_URL}/events/{created_event_id}", headers=headers)
                if response.status_code == 200:
                    self.log_test("Events - DELETE", True, "Successfully deleted event")
                else:
                    self.log_test("Events - DELETE", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test("Events - DELETE", False, f"Exception: {str(e)}")

    def test_temple_items_api(self):
        """Test Temple Items CRUD operations"""
        headers = self.get_auth_headers()
        
        # Test GET all items
        try:
            response = self.session.get(f"{BASE_URL}/temple-items", headers=headers)
            if response.status_code == 200:
                items = response.json()
                self.log_test("Temple Items - GET All", True, f"Retrieved {len(items)} items")
            else:
                self.log_test("Temple Items - GET All", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Temple Items - GET All", False, f"Exception: {str(e)}")

        # Create a simple base64 image for testing
        test_image = base64.b64encode(b"fake_image_data").decode('utf-8')
        
        test_item = {
            "name": "Sacred Rudraksha Mala",
            "price": 299.99,
            "description": "Authentic 108 bead Rudraksha mala for meditation and prayers",
            "category": "Prayer Items",
            "image_base64": test_image
        }
        
        created_item_id = None
        try:
            response = self.session.post(f"{BASE_URL}/temple-items", json=test_item, headers=headers)
            if response.status_code == 200:
                created_item = response.json()
                created_item_id = created_item.get("id")
                self.log_test("Temple Items - POST Create", True, f"Created item with ID: {created_item_id}")
            else:
                self.log_test("Temple Items - POST Create", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Temple Items - POST Create", False, f"Exception: {str(e)}")

        # Test PUT update item
        if created_item_id:
            updated_item = {
                "name": "Sacred Rudraksha Mala - Premium",
                "price": 399.99,
                "description": "Premium quality 108 bead Rudraksha mala",
                "category": "Prayer Items",
                "image_base64": test_image
            }
            try:
                response = self.session.put(
                    f"{BASE_URL}/temple-items/{created_item_id}", 
                    json=updated_item, 
                    headers=headers
                )
                if response.status_code == 200:
                    self.log_test("Temple Items - PUT Update", True, "Successfully updated item")
                else:
                    self.log_test("Temple Items - PUT Update", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test("Temple Items - PUT Update", False, f"Exception: {str(e)}")

            # Test DELETE item
            try:
                response = self.session.delete(f"{BASE_URL}/temple-items/{created_item_id}", headers=headers)
                if response.status_code == 200:
                    self.log_test("Temple Items - DELETE", True, "Successfully deleted item")
                else:
                    self.log_test("Temple Items - DELETE", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test("Temple Items - DELETE", False, f"Exception: {str(e)}")

        # Test price validation
        try:
            invalid_item = {
                "name": "Test Item",
                "price": "invalid_price",  # Should be float
                "description": "Test",
                "category": "Test",
                "image_base64": test_image
            }
            response = self.session.post(f"{BASE_URL}/temple-items", json=invalid_item, headers=headers)
            if response.status_code == 422:
                self.log_test("Temple Items - Price Validation", True, "Correctly rejected invalid price")
            else:
                self.log_test("Temple Items - Price Validation", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Temple Items - Price Validation", False, f"Exception: {str(e)}")

    def test_donations_api(self):
        """Test Donations CRUD operations"""
        headers = self.get_auth_headers()
        
        # Test GET all donations
        try:
            response = self.session.get(f"{BASE_URL}/donations", headers=headers)
            if response.status_code == 200:
                donations = response.json()
                self.log_test("Donations - GET All", True, f"Retrieved {len(donations)} donations")
            else:
                self.log_test("Donations - GET All", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Donations - GET All", False, f"Exception: {str(e)}")

        # Test POST create donation
        test_donation = {
            "donor_name": "Priya Sharma",
            "amount": 5100.00,
            "date": "2024-01-15",
            "purpose": "Temple Construction Fund",
            "contact_details": "priya.sharma@email.com, +91-9876543210"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/donations", json=test_donation, headers=headers)
            if response.status_code == 200:
                created_donation = response.json()
                donation_id = created_donation.get("id")
                self.log_test("Donations - POST Create", True, f"Created donation with ID: {donation_id}")
            else:
                self.log_test("Donations - POST Create", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Donations - POST Create", False, f"Exception: {str(e)}")

        # Test amount validation
        try:
            invalid_donation = {
                "donor_name": "Test Donor",
                "amount": "invalid_amount",  # Should be float
                "date": "2024-01-15",
                "purpose": "Test",
                "contact_details": "test@email.com"
            }
            response = self.session.post(f"{BASE_URL}/donations", json=invalid_donation, headers=headers)
            if response.status_code == 422:
                self.log_test("Donations - Amount Validation", True, "Correctly rejected invalid amount")
            else:
                self.log_test("Donations - Amount Validation", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Donations - Amount Validation", False, f"Exception: {str(e)}")

    def test_stories_api(self):
        """Test Stories CRUD operations"""
        headers = self.get_auth_headers()
        
        # Test GET all stories
        try:
            response = self.session.get(f"{BASE_URL}/stories", headers=headers)
            if response.status_code == 200:
                stories = response.json()
                self.log_test("Stories - GET All", True, f"Retrieved {len(stories)} stories")
            else:
                self.log_test("Stories - GET All", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Stories - GET All", False, f"Exception: {str(e)}")

        # Test POST create story
        test_story = {
            "title": "The Legend of Lord Ganesha",
            "content": "Once upon a time, in the divine realm of Kailash, Lord Shiva and Goddess Parvati lived in eternal bliss. This is the story of how Lord Ganesha, the remover of obstacles, came to be...",
            "category": "Mythology",
            "author": "Temple Priest",
            "date": "2024-01-15"
        }
        
        created_story_id = None
        try:
            response = self.session.post(f"{BASE_URL}/stories", json=test_story, headers=headers)
            if response.status_code == 200:
                created_story = response.json()
                created_story_id = created_story.get("id")
                self.log_test("Stories - POST Create", True, f"Created story with ID: {created_story_id}")
            else:
                self.log_test("Stories - POST Create", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Stories - POST Create", False, f"Exception: {str(e)}")

        # Test PUT update story
        if created_story_id:
            updated_story = {
                "title": "The Legend of Lord Ganesha - Complete Version",
                "content": "Updated: Once upon a time, in the divine realm of Kailash...",
                "category": "Mythology",
                "author": "Senior Temple Priest",
                "date": "2024-01-15"
            }
            try:
                response = self.session.put(
                    f"{BASE_URL}/stories/{created_story_id}", 
                    json=updated_story, 
                    headers=headers
                )
                if response.status_code == 200:
                    self.log_test("Stories - PUT Update", True, "Successfully updated story")
                else:
                    self.log_test("Stories - PUT Update", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test("Stories - PUT Update", False, f"Exception: {str(e)}")

            # Test DELETE story
            try:
                response = self.session.delete(f"{BASE_URL}/stories/{created_story_id}", headers=headers)
                if response.status_code == 200:
                    self.log_test("Stories - DELETE", True, "Successfully deleted story")
                else:
                    self.log_test("Stories - DELETE", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test("Stories - DELETE", False, f"Exception: {str(e)}")

    def test_statistics_api(self):
        """Test Statistics API"""
        headers = self.get_auth_headers()
        
        try:
            response = self.session.get(f"{BASE_URL}/stats", headers=headers)
            if response.status_code == 200:
                stats = response.json()
                expected_keys = ["kundali_users", "events", "temple_items", "donations", "stories", "total_donation_amount"]
                
                if all(key in stats for key in expected_keys):
                    self.log_test("Statistics - GET Stats", True, 
                                f"Retrieved all statistics: {stats}")
                else:
                    missing_keys = [key for key in expected_keys if key not in stats]
                    self.log_test("Statistics - GET Stats", False, 
                                f"Missing keys: {missing_keys}")
            else:
                self.log_test("Statistics - GET Stats", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Statistics - GET Stats", False, f"Exception: {str(e)}")

    def test_edge_cases(self):
        """Test edge cases and error handling"""
        headers = self.get_auth_headers()
        
        # Test invalid ID handling
        try:
            response = self.session.get(f"{BASE_URL}/kundali-users/invalid-id", headers=headers)
            if response.status_code == 404:
                self.log_test("Edge Cases - Invalid User ID", True, "Correctly handled invalid ID")
            else:
                self.log_test("Edge Cases - Invalid User ID", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Edge Cases - Invalid User ID", False, f"Exception: {str(e)}")

        # Test malformed JSON
        try:
            response = self.session.post(
                f"{BASE_URL}/events", 
                data="invalid json", 
                headers={**headers, "Content-Type": "application/json"}
            )
            if response.status_code == 422:
                self.log_test("Edge Cases - Malformed JSON", True, "Correctly rejected malformed JSON")
            else:
                self.log_test("Edge Cases - Malformed JSON", False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test("Edge Cases - Malformed JSON", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 80)
        print("TEMPLE ADMIN PANEL - BACKEND API TESTING")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print()

        # Authentication tests
        print("🔐 AUTHENTICATION TESTING")
        print("-" * 40)
        if not self.test_admin_login_success():
            print("❌ Cannot proceed without valid token")
            return False
        
        self.test_admin_login_failure()
        self.test_token_validation()
        print()

        # CRUD operations tests
        print("📊 CRUD OPERATIONS TESTING")
        print("-" * 40)
        self.test_kundali_users_api()
        self.test_events_api()
        self.test_temple_items_api()
        self.test_donations_api()
        self.test_stories_api()
        self.test_statistics_api()
        print()

        # Edge cases
        print("⚠️  EDGE CASES TESTING")
        print("-" * 40)
        self.test_edge_cases()
        print()

        # Summary
        self.print_summary()
        return True

    def print_summary(self):
        """Print test summary"""
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if "✅ PASS" in result["status"])
        failed = sum(1 for result in self.test_results if "❌ FAIL" in result["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if failed > 0:
            print("FAILED TESTS:")
            print("-" * 40)
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"❌ {result['test']}")
                    if result["message"]:
                        print(f"   {result['message']}")
        
        print()
        print("=" * 80)

if __name__ == "__main__":
    tester = TempleAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)