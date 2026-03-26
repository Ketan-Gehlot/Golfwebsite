import requests
import sys
from datetime import datetime
import json

class GolfCharityAPITester:
    def __init__(self, base_url="https://dynamic-color-stack.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if use_admin and self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token and not use_admin:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                except:
                    pass
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Raw response: {response.text[:200]}")

            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_preview": response.text[:100] if not success else "OK"
            })

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Request timeout")
            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": "TIMEOUT",
                "success": False,
                "response_preview": "Request timeout"
            })
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "response_preview": str(e)
            })
            return False, {}

    def test_admin_login(self):
        """Test admin login and get admin token"""
        print("\n" + "="*50)
        print("TESTING ADMIN LOGIN")
        print("="*50)
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@golfcharity.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"✅ Admin token obtained")
            return True
        print(f"❌ Admin login failed")
        return False

    def test_user_signup(self):
        """Test user signup"""
        print("\n" + "="*50)
        print("TESTING USER SIGNUP")
        print("="*50)
        
        test_user_data = {
            "email": "testuser@example.com",
            "password": "test123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data=test_user_data
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"✅ User token obtained")
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": "testuser@example.com", "password": "test123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_charities_endpoint(self):
        """Test charities endpoint"""
        print("\n" + "="*50)
        print("TESTING CHARITIES ENDPOINT")
        print("="*50)
        
        success, response = self.run_test(
            "Get Charities",
            "GET",
            "charities",
            200
        )
        
        if success:
            charities = response.get('charities', [])
            print(f"✅ Found {len(charities)} charities")
            if len(charities) >= 5:
                print(f"✅ Expected 5+ charities, found {len(charities)}")
                # Print first charity as sample
                if charities:
                    print(f"   Sample charity: {charities[0].get('name', 'Unknown')}")
            else:
                print(f"⚠️  Expected 5+ charities, only found {len(charities)}")
        
        return success

    def test_subscription_plans(self):
        """Test subscription plans endpoint"""
        print("\n" + "="*50)
        print("TESTING SUBSCRIPTION PLANS")
        print("="*50)
        
        success, response = self.run_test(
            "Get Subscription Plans",
            "GET",
            "subscriptions/plans",
            200
        )
        
        if success:
            plans = response.get('plans', [])
            print(f"✅ Found {len(plans)} plans")
            
            # Check for expected plans
            monthly_found = False
            yearly_found = False
            
            for plan in plans:
                if plan.get('id') == 'monthly' and plan.get('amount') == 9.99:
                    monthly_found = True
                    print(f"✅ Monthly plan found: ${plan.get('amount')}")
                elif plan.get('id') == 'yearly' and plan.get('amount') == 99.99:
                    yearly_found = True
                    print(f"✅ Yearly plan found: ${plan.get('amount')}")
            
            if not monthly_found:
                print(f"❌ Monthly $9.99 plan not found")
            if not yearly_found:
                print(f"❌ Yearly $99.99 plan not found")
        
        return success

    def test_admin_analytics(self):
        """Test admin analytics endpoint"""
        print("\n" + "="*50)
        print("TESTING ADMIN ANALYTICS")
        print("="*50)
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin Analytics",
            "GET",
            "admin/analytics",
            200,
            use_admin=True
        )
        
        if success:
            analytics = response
            expected_fields = ['total_users', 'active_subscribers', 'total_charities', 'current_prize_pool']
            for field in expected_fields:
                if field in analytics:
                    print(f"✅ {field}: {analytics[field]}")
                else:
                    print(f"❌ Missing field: {field}")
        
        return success

    def test_user_profile(self):
        """Test user profile endpoint"""
        print("\n" + "="*50)
        print("TESTING USER PROFILE")
        print("="*50)
        
        if not self.token:
            print("❌ No user token available")
            return False
            
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "users/me",
            200
        )
        
        if success:
            print(f"✅ User profile retrieved")
            print(f"   Email: {response.get('email')}")
            print(f"   Subscription: {response.get('subscription_status')}")
        
        return success

    def test_scores_endpoint(self):
        """Test scores endpoint (should require subscription)"""
        print("\n" + "="*50)
        print("TESTING SCORES ENDPOINT")
        print("="*50)
        
        if not self.token:
            print("❌ No user token available")
            return False
            
        # Try to get scores (should work even without subscription)
        success, response = self.run_test(
            "Get User Scores",
            "GET",
            "scores",
            200
        )
        
        if success:
            scores = response.get('scores', [])
            print(f"✅ Scores endpoint accessible, found {len(scores)} scores")
        
        # Try to add score (should fail without subscription)
        score_success, score_response = self.run_test(
            "Add Score (No Subscription)",
            "POST",
            "scores",
            403,  # Should fail with 403 Forbidden
            data={"score": 36, "score_date": "2026-01-15"}
        )
        
        if score_success:
            print(f"✅ Score addition correctly blocked without subscription")
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Golf Charity Platform API Tests")
        print(f"🌐 Base URL: {self.base_url}")
        print("="*60)
        
        # Test admin login first
        admin_login_success = self.test_admin_login()
        
        # Test user signup/login
        signup_success = self.test_user_signup()
        if not signup_success:
            # Try login if signup failed (user might already exist)
            login_success = self.test_user_login()
        
        # Test public endpoints
        self.test_charities_endpoint()
        self.test_subscription_plans()
        
        # Test authenticated endpoints
        if self.token:
            self.test_user_profile()
            self.test_scores_endpoint()
        
        # Test admin endpoints
        if self.admin_token:
            self.test_admin_analytics()
        
        # Print final results
        print("\n" + "="*60)
        print("📊 FINAL TEST RESULTS")
        print("="*60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['name']}: {result['actual_status']} (expected {result['expected_status']})")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = GolfCharityAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())