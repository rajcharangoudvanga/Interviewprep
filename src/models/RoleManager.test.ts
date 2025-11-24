import { RoleManager, InvalidRoleInputError } from './RoleManager';

describe('RoleManager', () => {
    let roleManager: RoleManager;

    beforeEach(() => {
        roleManager = new RoleManager();
    });

    describe('getAvailableRoles', () => {
        it('should return a non-empty array of job roles', () => {
            const roles = roleManager.getAvailableRoles();
            expect(roles).toBeInstanceOf(Array);
            expect(roles.length).toBeGreaterThan(0);
        });

        it('should return roles with all required properties', () => {
            const roles = roleManager.getAvailableRoles();
            roles.forEach(role => {
                expect(role).toHaveProperty('id');
                expect(role).toHaveProperty('name');
                expect(role).toHaveProperty('technicalSkills');
                expect(role).toHaveProperty('behavioralCompetencies');
                expect(role).toHaveProperty('questionCategories');
                expect(Array.isArray(role.technicalSkills)).toBe(true);
                expect(Array.isArray(role.behavioralCompetencies)).toBe(true);
                expect(Array.isArray(role.questionCategories)).toBe(true);
            });
        });

        it('should include predefined roles', () => {
            const roles = roleManager.getAvailableRoles();
            const roleNames = roles.map(r => r.name);
            expect(roleNames).toContain('Software Engineer');
            expect(roleNames).toContain('Product Manager');
            expect(roleNames).toContain('Data Scientist');
        });
    });

    describe('getAvailableExperienceLevels', () => {
        it('should return a non-empty array of experience levels', () => {
            const levels = roleManager.getAvailableExperienceLevels();
            expect(levels).toBeInstanceOf(Array);
            expect(levels.length).toBeGreaterThan(0);
        });

        it('should return levels with all required properties', () => {
            const levels = roleManager.getAvailableExperienceLevels();
            levels.forEach(level => {
                expect(level).toHaveProperty('level');
                expect(level).toHaveProperty('yearsMin');
                expect(level).toHaveProperty('yearsMax');
                expect(level).toHaveProperty('expectedDepth');
                expect(['entry', 'mid', 'senior', 'lead']).toContain(level.level);
            });
        });

        it('should include all standard experience levels', () => {
            const levels = roleManager.getAvailableExperienceLevels();
            const levelNames = levels.map(l => l.level);
            expect(levelNames).toContain('entry');
            expect(levelNames).toContain('mid');
            expect(levelNames).toContain('senior');
            expect(levelNames).toContain('lead');
        });
    });

    describe('getRoleById', () => {
        it('should return the correct role for valid ID', () => {
            const role = roleManager.getRoleById('software-engineer');
            expect(role.name).toBe('Software Engineer');
            expect(role.id).toBe('software-engineer');
        });

        it('should throw InvalidRoleInputError for invalid role ID', () => {
            expect(() => {
                roleManager.getRoleById('invalid-role');
            }).toThrow(InvalidRoleInputError);
        });

        it('should include available options in error', () => {
            try {
                roleManager.getRoleById('invalid-role');
                fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidRoleInputError);
                const invalidError = error as InvalidRoleInputError;
                expect(invalidError.availableOptions).toBeInstanceOf(Array);
                expect(invalidError.availableOptions.length).toBeGreaterThan(0);
                expect(invalidError.availableOptions).toContain('software-engineer');
            }
        });
    });

    describe('getRoleByName', () => {
        it('should return the correct role for valid name', () => {
            const role = roleManager.getRoleByName('Software Engineer');
            expect(role.name).toBe('Software Engineer');
            expect(role.id).toBe('software-engineer');
        });

        it('should be case-insensitive', () => {
            const role1 = roleManager.getRoleByName('software engineer');
            const role2 = roleManager.getRoleByName('SOFTWARE ENGINEER');
            const role3 = roleManager.getRoleByName('Software Engineer');
            expect(role1.id).toBe(role2.id);
            expect(role2.id).toBe(role3.id);
        });

        it('should handle leading/trailing whitespace', () => {
            const role = roleManager.getRoleByName('  Software Engineer  ');
            expect(role.name).toBe('Software Engineer');
        });

        it('should throw InvalidRoleInputError for invalid role name', () => {
            expect(() => {
                roleManager.getRoleByName('Invalid Role Name');
            }).toThrow(InvalidRoleInputError);
        });

        it('should include available role names in error', () => {
            try {
                roleManager.getRoleByName('Invalid Role');
                fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidRoleInputError);
                const invalidError = error as InvalidRoleInputError;
                expect(invalidError.availableOptions).toContain('Software Engineer');
                expect(invalidError.availableOptions).toContain('Product Manager');
            }
        });
    });

    describe('getExperienceLevel', () => {
        it('should return the correct level for valid input', () => {
            const level = roleManager.getExperienceLevel('mid');
            expect(level.level).toBe('mid');
            expect(level.yearsMin).toBeDefined();
            expect(level.yearsMax).toBeDefined();
        });

        it('should be case-insensitive', () => {
            const level1 = roleManager.getExperienceLevel('mid');
            const level2 = roleManager.getExperienceLevel('MID');
            const level3 = roleManager.getExperienceLevel('Mid');
            expect(level1.level).toBe(level2.level);
            expect(level2.level).toBe(level3.level);
        });

        it('should handle leading/trailing whitespace', () => {
            const level = roleManager.getExperienceLevel('  senior  ');
            expect(level.level).toBe('senior');
        });

        it('should throw InvalidRoleInputError for invalid level', () => {
            expect(() => {
                roleManager.getExperienceLevel('invalid-level');
            }).toThrow(InvalidRoleInputError);
        });

        it('should include available levels in error', () => {
            try {
                roleManager.getExperienceLevel('invalid');
                fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidRoleInputError);
                const invalidError = error as InvalidRoleInputError;
                expect(invalidError.availableOptions).toContain('entry');
                expect(invalidError.availableOptions).toContain('mid');
                expect(invalidError.availableOptions).toContain('senior');
                expect(invalidError.availableOptions).toContain('lead');
            }
        });
    });

    describe('validation methods', () => {
        it('isValidRoleId should return true for valid IDs', () => {
            expect(roleManager.isValidRoleId('software-engineer')).toBe(true);
            expect(roleManager.isValidRoleId('product-manager')).toBe(true);
        });

        it('isValidRoleId should return false for invalid IDs', () => {
            expect(roleManager.isValidRoleId('invalid-role')).toBe(false);
            expect(roleManager.isValidRoleId('')).toBe(false);
        });

        it('isValidRoleName should return true for valid names', () => {
            expect(roleManager.isValidRoleName('Software Engineer')).toBe(true);
            expect(roleManager.isValidRoleName('software engineer')).toBe(true);
        });

        it('isValidRoleName should return false for invalid names', () => {
            expect(roleManager.isValidRoleName('Invalid Role')).toBe(false);
            expect(roleManager.isValidRoleName('')).toBe(false);
        });

        it('isValidExperienceLevel should return true for valid levels', () => {
            expect(roleManager.isValidExperienceLevel('entry')).toBe(true);
            expect(roleManager.isValidExperienceLevel('mid')).toBe(true);
            expect(roleManager.isValidExperienceLevel('SENIOR')).toBe(true);
        });

        it('isValidExperienceLevel should return false for invalid levels', () => {
            expect(roleManager.isValidExperienceLevel('invalid')).toBe(false);
            expect(roleManager.isValidExperienceLevel('')).toBe(false);
        });
    });

    describe('display name methods', () => {
        it('getRoleDisplayNames should return array of role names', () => {
            const names = roleManager.getRoleDisplayNames();
            expect(names).toBeInstanceOf(Array);
            expect(names.length).toBeGreaterThan(0);
            expect(names).toContain('Software Engineer');
            expect(names).toContain('Product Manager');
        });

        it('getExperienceLevelDisplayNames should return array of level names', () => {
            const names = roleManager.getExperienceLevelDisplayNames();
            expect(names).toBeInstanceOf(Array);
            expect(names).toContain('entry');
            expect(names).toContain('mid');
            expect(names).toContain('senior');
            expect(names).toContain('lead');
        });
    });

    describe('role data integrity', () => {
        it('all roles should have non-empty technical skills', () => {
            const roles = roleManager.getAvailableRoles();
            roles.forEach(role => {
                expect(role.technicalSkills.length).toBeGreaterThan(0);
            });
        });

        it('all roles should have non-empty behavioral competencies', () => {
            const roles = roleManager.getAvailableRoles();
            roles.forEach(role => {
                expect(role.behavioralCompetencies.length).toBeGreaterThan(0);
            });
        });

        it('all roles should have question categories with valid weights', () => {
            const roles = roleManager.getAvailableRoles();
            roles.forEach(role => {
                expect(role.questionCategories.length).toBeGreaterThan(0);
                role.questionCategories.forEach(category => {
                    expect(category.weight).toBeGreaterThan(0);
                    expect(category.weight).toBeLessThanOrEqual(1);
                    expect(typeof category.technicalFocus).toBe('boolean');
                });
            });
        });

        it('experience levels should have valid year ranges', () => {
            const levels = roleManager.getAvailableExperienceLevels();
            levels.forEach(level => {
                expect(level.yearsMin).toBeGreaterThanOrEqual(0);
                expect(level.yearsMax).toBeGreaterThan(level.yearsMin);
                expect(level.expectedDepth).toBeGreaterThan(0);
                expect(level.expectedDepth).toBeLessThanOrEqual(10);
            });
        });
    });
});
