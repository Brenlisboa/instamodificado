#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class PlayModzProAPITester:
    def __init__(self, base_url="https://64668ba7-d280-4ad7-9dff-50899f225349.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_app_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def test_health_check(self):
        """Test health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                return self.log_test("Health Check", True, f"- Status: {data.get('status')}")
            else:
                return self.log_test("Health Check", False, f"- Status Code: {response.status_code}")
        except Exception as e:
            return self.log_test("Health Check", False, f"- Error: {str(e)}")

    def test_get_all_apps(self):
        """Test getting all apps"""
        try:
            response = requests.get(f"{self.base_url}/api/apps", timeout=10)
            success = response.status_code == 200
            if success:
                apps = response.json()
                return self.log_test("Get All Apps", True, f"- Found {len(apps)} apps")
            else:
                return self.log_test("Get All Apps", False, f"- Status Code: {response.status_code}")
        except Exception as e:
            return self.log_test("Get All Apps", False, f"- Error: {str(e)}")

    def test_get_apps_by_category(self):
        """Test filtering apps by category"""
        categories = ["jogos", "aplicativos"]
        all_passed = True
        
        for category in categories:
            try:
                response = requests.get(f"{self.base_url}/api/apps?category={category}", timeout=10)
                success = response.status_code == 200
                if success:
                    apps = response.json()
                    # Verify all apps belong to the requested category
                    category_match = all(app.get('category') == category for app in apps)
                    if category_match:
                        self.log_test(f"Get Apps - Category '{category}'", True, f"- Found {len(apps)} apps")
                    else:
                        self.log_test(f"Get Apps - Category '{category}'", False, "- Category mismatch in results")
                        all_passed = False
                else:
                    self.log_test(f"Get Apps - Category '{category}'", False, f"- Status Code: {response.status_code}")
                    all_passed = False
            except Exception as e:
                self.log_test(f"Get Apps - Category '{category}'", False, f"- Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_admin_authentication(self):
        """Test admin authentication"""
        # Test correct password
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/admin",
                json={"password": "admin"},
                timeout=10
            )
            success = response.status_code == 200
            if success:
                data = response.json()
                auth_success = data.get('authenticated', False)
                self.log_test("Admin Auth - Correct Password", auth_success, f"- Response: {data.get('message')}")
            else:
                self.log_test("Admin Auth - Correct Password", False, f"- Status Code: {response.status_code}")
        except Exception as e:
            self.log_test("Admin Auth - Correct Password", False, f"- Error: {str(e)}")
            return False

        # Test incorrect password
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/admin",
                json={"password": "wrong"},
                timeout=10
            )
            success = response.status_code == 401
            self.log_test("Admin Auth - Wrong Password", success, f"- Status Code: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Admin Auth - Wrong Password", False, f"- Error: {str(e)}")
            return False

    def test_create_app(self):
        """Test creating a new app"""
        test_app = {
            "name": "Test App",
            "description": "This is a test app created by automated testing",
            "version": "1.0.0",
            "category": "aplicativos",
            "icon_url": "https://via.placeholder.com/64x64/dc2626/ffffff?text=TEST",
            "apk_url": "https://example.com/test-app.apk",
            "size": "50 MB",
            "developer": "Test Developer",
            "rating": 4.2
        }

        try:
            response = requests.post(
                f"{self.base_url}/api/apps",
                json=test_app,
                timeout=10
            )
            success = response.status_code == 200
            if success:
                created_app = response.json()
                self.created_app_id = created_app.get('id')
                return self.log_test("Create App", True, f"- Created app with ID: {self.created_app_id}")
            else:
                return self.log_test("Create App", False, f"- Status Code: {response.status_code}")
        except Exception as e:
            return self.log_test("Create App", False, f"- Error: {str(e)}")

    def test_get_specific_app(self):
        """Test getting a specific app by ID"""
        if not self.created_app_id:
            return self.log_test("Get Specific App", False, "- No app ID available (create test failed)")

        try:
            response = requests.get(f"{self.base_url}/api/apps/{self.created_app_id}", timeout=10)
            success = response.status_code == 200
            if success:
                app = response.json()
                return self.log_test("Get Specific App", True, f"- Retrieved app: {app.get('name')}")
            else:
                return self.log_test("Get Specific App", False, f"- Status Code: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Specific App", False, f"- Error: {str(e)}")

    def test_update_app(self):
        """Test updating an existing app"""
        if not self.created_app_id:
            return self.log_test("Update App", False, "- No app ID available (create test failed)")

        updated_app = {
            "name": "Updated Test App",
            "description": "This app has been updated by automated testing",
            "version": "2.0.0",
            "category": "jogos",
            "icon_url": "https://via.placeholder.com/64x64/dc2626/ffffff?text=UPD",
            "apk_url": "https://example.com/updated-test-app.apk",
            "size": "75 MB",
            "developer": "Updated Test Developer",
            "rating": 4.8
        }

        try:
            response = requests.put(
                f"{self.base_url}/api/apps/{self.created_app_id}",
                json=updated_app,
                timeout=10
            )
            success = response.status_code == 200
            if success:
                app = response.json()
                return self.log_test("Update App", True, f"- Updated app: {app.get('name')}")
            else:
                return self.log_test("Update App", False, f"- Status Code: {response.status_code}")
        except Exception as e:
            return self.log_test("Update App", False, f"- Error: {str(e)}")

    def test_download_tracking(self):
        """Test download tracking"""
        if not self.created_app_id:
            return self.log_test("Download Tracking", False, "- No app ID available (create test failed)")

        try:
            response = requests.post(f"{self.base_url}/api/apps/{self.created_app_id}/download", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                return self.log_test("Download Tracking", True, f"- Response: {data.get('message')}")
            else:
                return self.log_test("Download Tracking", False, f"- Status Code: {response.status_code}")
        except Exception as e:
            return self.log_test("Download Tracking", False, f"- Error: {str(e)}")

    def test_delete_app(self):
        """Test deleting an app"""
        if not self.created_app_id:
            return self.log_test("Delete App", False, "- No app ID available (create test failed)")

        try:
            response = requests.delete(f"{self.base_url}/api/apps/{self.created_app_id}", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                return self.log_test("Delete App", True, f"- Response: {data.get('message')}")
            else:
                return self.log_test("Delete App", False, f"- Status Code: {response.status_code}")
        except Exception as e:
            return self.log_test("Delete App", False, f"- Error: {str(e)}")

    def test_get_nonexistent_app(self):
        """Test getting a non-existent app"""
        fake_id = "non-existent-id-12345"
        try:
            response = requests.get(f"{self.base_url}/api/apps/{fake_id}", timeout=10)
            success = response.status_code == 404
            return self.log_test("Get Non-existent App", success, f"- Status Code: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Non-existent App", False, f"- Error: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Play Modz Pro API Tests")
        print("=" * 50)
        
        # Basic connectivity and health
        self.test_health_check()
        
        # App retrieval tests
        self.test_get_all_apps()
        self.test_get_apps_by_category()
        
        # Authentication tests
        self.test_admin_authentication()
        
        # CRUD operations
        self.test_create_app()
        self.test_get_specific_app()
        self.test_update_app()
        self.test_download_tracking()
        self.test_delete_app()
        
        # Error handling
        self.test_get_nonexistent_app()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main function"""
    print("Play Modz Pro Backend API Testing")
    print(f"Testing against: https://64668ba7-d280-4ad7-9dff-50899f225349.preview.emergentagent.com")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tester = PlayModzProAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())